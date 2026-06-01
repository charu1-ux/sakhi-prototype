export default function JobsOldUserFrame() {
  return (
    <div className="flex h-full w-full flex-col">
      <iframe
        src="/jobs/index.html"
        title="Jobs – Old user"
        className="block min-h-0 w-full flex-1 border-0"
        allow="microphone; camera"
      />
    </div>
  );
}
