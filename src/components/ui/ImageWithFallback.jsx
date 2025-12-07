import { useState } from 'react';

export default function ImageWithFallback({ src, alt, className, fallback = '/image-default.png' }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}