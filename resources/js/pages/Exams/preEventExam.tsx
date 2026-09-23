import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

type Choice = { id: number; choice_text: string };
type Question = { id: number; question_text: string; choices: Choice[] };

type Props = {
  questions: Question[] | Record<string, Question>;
  attemptId: number;
  examTitle?: string;
  isActive?: boolean;
};

// Fisher–Yates shuffle (stable, unbiased)
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const PreEventExam = ({ questions, attemptId, examTitle }: Props) => {
  // 1) Normalize questions prop to array
  const normalizedQuestions = useMemo<Question[]>(() => {
    if (Array.isArray(questions)) return questions;
    if (!questions) return [];
    return Object.values(questions);
  }, [questions]);

  // 2) Randomize ONCE per page load:
  //    - randomize question order
  //    - randomize choices order inside each question
  const questionsArray = useMemo<Question[]>(() => {
    const withShuffledChoices = normalizedQuestions.map((q) => ({
      ...q,
      choices: shuffle(q.choices ?? []),
    }));

    return shuffle(withShuffledChoices);
  }, [normalizedQuestions]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const isComplete =
    questionsArray.length > 0 && questionsArray.every((q) => !!answers[q.id]);

  const submitExam = () => {
    if (!isComplete) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    // IMPORTANT: use questionsArray here (shuffled order),
    // but it doesn't matter because we submit by question_id.
    const payloadAnswers = questionsArray.map((q) => ({
      question_id: q.id,
      selected_choice_id: answers[q.id],
    }));

    setSubmitting(true);

    router.post(
      route('examAttempts.submit'),
      { attempt_id: attemptId, answers: payloadAnswers },
      {
        onFinish: () => setSubmitting(false),
        onError: (e: any) =>
          toast.error(e?.attempt_id ?? e?.answers ?? 'Submit failed'),
        onSuccess: () => toast.success('Submitted!'),
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center pb-10">
      <Card className="mt-5 w-[90%]">
        <CardContent className="pt-6">
          <Label className="text-2xl">{examTitle ?? 'Exam'}</Label>
          <CardDescription className="mt-2">

           <h2 className='mb-2'>Evaluate Your Knowledge and Skills</h2>
    <p className='md:w-[80%]'>Thank you for attending the WAHtermelon training session! This assessment is designed to gauge your current understanding of the key concepts, tools, and functionalities of the system that will be covered during the training.</p>

          </CardDescription>
        </CardContent>
      </Card>

      {questionsArray.map((q, idx) => (
        <Card key={q.id} className="my-5 w-[90%]">
          <CardContent className="pt-6">
            <Label className="text-base font-bold">
              {idx + 1}. {q.question_text}
            </Label>

            <RadioGroup
              className="mt-4 space-y-2"
              value={answers[q.id]?.toString() ?? ''}
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [q.id]: Number(value) }))
              }
            >
              {(q.choices ?? []).map((c) => (
                <div key={c.id} className="flex items-center gap-3 hover:bg-muted p-2 rounded-md">
                  <RadioGroupItem
                  className='border-3 border-purple-600'
                    value={c.id.toString()}
                    id={`q_${q.id}_c_${c.id}`}
                  />
                  <Label htmlFor={`q_${q.id}_c_${c.id}`}>{c.choice_text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Button
        className="w-fit"
        onClick={submitExam}
        disabled={!isComplete || submitting}
      >
        {submitting ? 'Submitting...' : 'SUBMIT'}
      </Button>
    </div>
  );
};

export default PreEventExam;