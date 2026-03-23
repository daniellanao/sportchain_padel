/** True if `src` is absolute — use with `next/image` `unoptimized` when the host is not in `remotePatterns`. */
export function isRemoteImageSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}
