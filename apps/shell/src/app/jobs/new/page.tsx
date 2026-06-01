export default function JobsNewUserFrame() {
  return (
    <div className="flex h-full w-full flex-col">
      <iframe
        src="/jobs/zero/index.html"
        title="Jobs – New user"
        className="block min-h-0 w-full flex-1 border-0"
        allow="microphone; camera"
      />
    </div>
  );
}
