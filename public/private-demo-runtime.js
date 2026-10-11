(function () {
  'use strict';
  var nativeFetch = window.fetch.bind(window);
  // The van model is larger than a buffered serverless response. Range requests
  // keep every private response below 2 MB and recheck the session each time.
  window.fetch = async function (input, options) {
    var request = new Request(input, options);
    var url = new URL(request.url);
    if (url.origin !== location.origin || !/\/visit\/\d{6}\/content\/[a-f0-9]{64}\/.*\.glb$/.test(url.pathname) || request.method !== 'GET' || request.headers.has('Range')) {
      return nativeFetch(request);
    }
    var head = await nativeFetch(request.url, { method: 'HEAD', credentials: 'omit', cache: 'no-store', signal: request.signal });
    if (!head.ok) return head;
    var length = Number(head.headers.get('Content-Length'));
    if (!Number.isSafeInteger(length) || length <= 0 || length > 64 * 1024 * 1024) throw new Error('Preview asset unavailable.');
    var pieces = [];
    for (var start = 0; start < length; start += 2 * 1024 * 1024) {
      var end = Math.min(length - 1, start + 2 * 1024 * 1024 - 1);
      var part = await nativeFetch(request.url, { headers: { Range: 'bytes=' + start + '-' + end }, credentials: 'omit', cache: 'no-store', signal: request.signal });
      if (part.status !== 206) return part;
      var bytes = await part.arrayBuffer();
      if (bytes.byteLength !== end - start + 1) throw new Error('Incomplete preview asset.');
      pieces.push(bytes);
    }
    return new Response(new Blob(pieces, { type: 'model/gltf-binary' }), { headers: { 'Content-Type': 'model/gltf-binary', 'Content-Length': String(length) } });
  };
}());
