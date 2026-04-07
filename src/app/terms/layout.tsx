import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | CuteCode',
  description: 'Terms and conditions for CuteCode usage.',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-black py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
        {children}
      </div>
    </div>
  )
}
