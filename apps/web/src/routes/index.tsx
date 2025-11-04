import { createFileRoute } from '@tanstack/react-router';

function HomePage() {
  return (
    <div className="h-[calc(100vh-var(--header-height))] flex items-center justify-center">
      <h1 className="text-6xl font-bold">overlays app</h1>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
});
