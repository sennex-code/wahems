import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  score?: number;
  examTitle?: string;
  eventId?: number;
  examType?: string;
}

const ExamSubmissionConfirmation = ({ score, examTitle }: Props) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // If score is not present, trigger error state
    if (score === undefined || score === null) {
      setHasError(true);
    }
  }, [score]);

  // Error UI
  if (hasError) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center">
        <Card className="max-w-md w-full p-0 shadow-md border-2 border-red-500">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="mb-6 w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="mb-4 text-base font-semibold">
                Unable to display your exam score. <br />
                You may have already submitted or refreshed the page.
              </p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success UI
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-linear-to-br from-black via-indigo-950 to-purple-950">
      <Card className="max-w-md w-full p-0 shadow-md">
        <CardContent className="p-8 flex flex-col items-center">
          <div className="mb-6 w-full text-center">
            <h2 className="text-3xl font-bold mb-2">Exam Submitted!</h2>
            <p className="mb-6 text-lg font-semibold">
              {examTitle ? `You have completed the ${examTitle}.` : 'You have completed the exam.'}
            </p>
            <div className="my-6">
              <span className="block text-5xl font-extrabold">
                {score}
              </span>
              <span className="block mt-2 text-base font-medium">
                Your Score
              </span>
            </div>
            <p className="text-base">
              Thank you for taking the exam. <br />
              Your submission has been received.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSubmissionConfirmation;