import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Choice {
  id?: string;
  choice_text: string;
  is_correct: boolean;
}
export interface QuestionCreateUpdate {
  id?: string;
  question_text: string;
  choices: Choice[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionCreateUpdate) => void;
  initialData?: QuestionCreateUpdate | null;
}

export const QuestionFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false }
  ]);

  useEffect(() => {
    if (open) {
      setQuestionText(initialData?.question_text ?? "");
      setChoices(
        initialData?.choices?.length
          ? initialData.choices
          : [
              { choice_text: "", is_correct: false },
              { choice_text: "", is_correct: false }
            ]
      );
    }
  }, [open, initialData]);

  const setCorrectChoice = (idx: number) => {
    setChoices((curr) =>
      curr.map((c, i) => ({ ...c, is_correct: i === idx }))
    );
  };
  const handleChangeChoice = (idx: number, value: string) => {
    setChoices((curr) =>
      curr.map((c, i) =>
        i === idx ? { ...c, choice_text: value } : c
      )
    );
  };
  const addChoice = () => setChoices((c) => [...c, { choice_text: "", is_correct: false }]);
  const removeChoice = (idx: number) => {
    if (choices.length <= 2) return;
    setChoices((curr) => curr.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      question_text: questionText,
      choices,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <Card
        className="relative max-h-[80vh] w-full max-w-[500px] overflow-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-4">
          <CardTitle>{initialData ? "Edit Question" : "Add Question"}</CardTitle>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-muted-foreground hover:text-black absolute top-3 right-3 bg-transparent border-none"
            type="button"
          >
            &times;
          </button>
        </CardHeader>
        <CardContent>
          <form className="py-2 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="qtext">Question</Label>
              <Input
                id="qtext"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question..."
                required
              />
            </div>
            <div>
              <Label>Choices</Label>
              <div className="flex flex-col gap-2 mt-2">
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={choice.is_correct}
                      onChange={() => setCorrectChoice(idx)}
                      className="accent-green-600"
                      required
                    />
                    <Input
                      value={choice.choice_text}
                      onChange={(e) => handleChangeChoice(idx, e.target.value)}
                      placeholder={`Choice ${idx + 1}`}
                      required
                    />
                    {choices.length > 2 && (
                      <Button
                        type="button"
                        className="ml-1 p-1 text-red-500 hover:bg-red-50"
                        onClick={() => removeChoice(idx)}
                        variant="ghost"
                        tabIndex={-1}
                      >
                        &minus;
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" className="mt-2 w-fit" variant="secondary" onClick={addChoice}>
                  + Add Choice
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{initialData ? "Save" : "Add"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionFormModal;