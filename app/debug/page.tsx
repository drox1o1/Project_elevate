import { DebugWaitlistForm } from "@/components/debug-waitlist-form"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#075056]">Waitlist Debug Page</h1>

        <div className="mb-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h2 className="font-bold text-yellow-800 mb-2">Debug Instructions:</h2>
          <ol className="list-decimal list-inside text-yellow-800 text-sm space-y-1">
            <li>Fill out the form below</li>
            <li>Check the browser console for detailed logs</li>
            <li>Check the server logs for backend errors</li>
            <li>Report any errors you see</li>
          </ol>
        </div>

        <DebugWaitlistForm />

        <div className="mt-8 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">Environment Check:</h3>
          <p className="text-blue-800 text-sm">
            Open your browser's developer console (F12) to see detailed debugging information.
          </p>
        </div>
      </div>
    </div>
  )
}
