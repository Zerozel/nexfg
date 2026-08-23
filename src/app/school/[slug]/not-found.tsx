export default function SchoolNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-300">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          School website not found
        </h1>
        <p className="mt-2 text-gray-500">
          This school website doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <a
          href="https://nexaforges.me"
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#2563eb' }}
        >
          Go to NexaForges
        </a>
      </div>
    </div>
  );
}
