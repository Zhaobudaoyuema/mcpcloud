import React, { ReactNode } from 'react';

interface ContentProps {
  children: ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-auto bg-warm-beige px-4 py-6 dark:bg-gray-900 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
};

export default Content;