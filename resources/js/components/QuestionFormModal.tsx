import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Choice {
  id?: string;
  choice_text: string;
  is_correct: boolean;
}
export interface QuestionFormValues {
  id?: string;
  question_text: string;
  choices: Choice[];
}

interface QuestionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: QuestionFormValues) => void;
  initialValues?: QuestionFormValues; // if present, it's "edit", else "add"
}

const emptyChoice = (): Choice => ({
  choice_text: "",
  is_correct: false,
});

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
  ]);
  const isEditing = !!initialValues?.id;

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setQuestionText(initialValues?.question_text || "");
      setChoices(
        initialValues?.choices.length
          ? initialValues.choices
          : [emptyChoice(), emptyChoice()]
      );
    }
  }, [open, initialValues]);

  // For single correct answer: set this one true, others false
  const handleSetCorrect = (index: number) => {
    setChoices((prev) =>
      prev.map((c, i) => ({
        ...c,
        is_correct: i === index,
      }))
    );
  };

  const handleChoiceTextChange = (index: number, newText: string) => {
    setChoices((prev) =>
      prev.map((c, i) => (i === index ? { ...c, choice_text: newText } : c))
    );
  };

  const handleAddChoice = () => {
    setChoices((prev) => [...prev, emptyChoice()]);
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length <= 2) return; // Always require at least two choices
    setChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Question text is required.");
      return;
    }
    if (
      choices.length < 2 ||
      choices.some((c) => !c.choice_text.trim()) ||
      !choices.some((c) => c.is_correct)
    ) {
      alert("At least 2 choices with one marked as correct are required.");
      return;
    }
    onSubmit({
      id: initialValues?.id,
      question_text: questionText,
      choices,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <Card
        className="relative max-h-[80vh] w-full max-w-[500px] overflow-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-4">
          <CardTitle>
            {isEditing ? "Edit Question" : "Add New Question"}
          </CardTitle>
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
          <form className="py-2 px-0 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <Label>Question</Label>
              <Input
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question..."
                required
              />
            </div>
            <div>
              <Label>Choices (select one correct)</Label>
              <div className="flex flex-col gap-2 mt-2">
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={choice.is_correct}
                      onChange={() => handleSetCorrect(idx)}
                      className="accent-green-600"
                      required
                    />
                    <Input
                      value={choice.choice_text}
                      onChange={(e) =>
                        handleChoiceTextChange(idx, e.target.value)
                      }
                      placeholder={`Choice ${idx + 1}`}
                      required
                    />
                    {choices.length > 2 && (
                      <Button
                        type="button"
                        className="ml-1 p-1 text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveChoice(idx)}
                        variant="ghost"
                        title="Remove choice"
                        tabIndex={-1}
                      >
                        &minus;
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  className="mt-2 w-fit"
                  variant="secondary"
                  onClick={handleAddChoice}
                >
                  + Add Choice
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save" : "Add"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionFormModal;