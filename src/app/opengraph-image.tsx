import { createSocialImage, socialImageSize } from "@/components/social-image";

export const alt = "SLO Web Design - Modern websites for local businesses";
export const size = socialImageSize;
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return createSocialImage();
}
