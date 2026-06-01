export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-6 border-white/20 border-t-white" />
      
      </div>
    </div>
  );
}