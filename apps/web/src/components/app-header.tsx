import { Button } from '@zohan/ui/components/button';
import { Settings } from 'lucide-react';

export const AppHeader = () => {
  return (
    <header className="h-[--header-height] flex items-center justify-between px-4 border-b">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xl">APP_NAME</span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="icon" className="size-8" variant="ghost">
          <Settings />
        </Button>
      </div>
    </header>
  );
};
