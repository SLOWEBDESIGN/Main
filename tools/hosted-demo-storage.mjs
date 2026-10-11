import { AccessError } from './demo-access.mjs';

// The SQL RPC accepts an update only if the database revision is unchanged.
// A losing caller rereads state and reruns the business rules before retrying.
export function createHostedDemoStorage(client) {
  async function entry(key) {
    const { data, error } = await client.from('swd_private_demo_state')
      .select('state,version').eq('key', key).maybeSingle();
    if (error) throw new AccessError('Preview storage is temporarily unavailable.', 503);
    return data;
  }
  return {
    async read(key) { return (await entry(key))?.state ?? null; },
    async change(key, update) {
      for (let attempt = 0; attempt < 16; attempt++) {
        const old = await entry(key);
        const { state, result } = update(old?.state ?? null);
        const { data, error } = await client.rpc('swd_demo_state_compare_and_swap', {
          p_key: key, p_expected_version: old?.version ?? null, p_state: state,
        });
        if (error) throw new AccessError('Preview storage is temporarily unavailable.', 503);
        if (data === true) return result;
        await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 30));
      }
      throw new AccessError('Please try again in a moment.', 503);
    },
  };
}
