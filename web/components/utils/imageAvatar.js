export default function ImageAvatar(props) {
  const { wunderId } = props;
  return (
    <div
      className="flex w-10 h-10 mb-1 rounded-full overflow-hidden items-center justify-center border border-white"
      type="file"
      name="profilePicture"
    >
      <img
        className="object-cover min-w-full min-h-full"
        src={`/api/proxy/users/getImage?wunderId=${wunderId}`}
      />
    </div>
  );
}
