export default function ThumbImage({ photo, ...props }) {
  return (
    <img
      src={photo.thumbUrl}
      onError={(e) => {
        if (e.currentTarget.src !== photo.url) e.currentTarget.src = photo.url;
      }}
      alt=""
      loading="lazy"
      {...props}
    />
  );
}
