<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ExamBankQuestion;

class ExamManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($bank)
    {
        $examQuestions = ExamBankQuestion::where('bank', $bank)->with('choices')->get();
        return response()->json($examQuestions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $bank)
    {
        $validated = $request->validate([
            'question_text' => 'required|string|max:255',
            'choices' => 'required|array|min:2',
            'choices.*.choice_text' => 'required|string|max:255',
            'choices.*.is_correct' => 'required|boolean',
        ]);

        // Create the question
        $examQuestion = ExamBankQuestion::create([
            'question_text' => $validated['question_text'],
            'bank' => $bank,
        ]);

        // Attach choices
        foreach ($validated['choices'] as $choice) {
            $examQuestion->choices()->create([
                'choice_text' => $choice['choice_text'],
                'is_correct' => $choice['is_correct'],
            ]);
        }

        $examQuestion->load('choices');
        return response()->json($examQuestion, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $bank, $id)
    {
        $validated = $request->validate([
            'question_text' => 'required|string|max:255',
            'choices' => 'required|array|min:2',
           'choices.*.id' => 'sometimes|exists:question_choices,id',
            'choices.*.choice_text' => 'required|string|max:255',
            'choices.*.is_correct' => 'required|boolean',
        ]);

        $examQuestion = ExamBankQuestion::where('bank', $bank)->findOrFail($id);
        $examQuestion->question_text = $validated['question_text'];
        $examQuestion->save();

        // Remove any choices not present in the sent list
        $submittedIds = collect($validated['choices'])
            ->pluck('id')   
            ->filter()
            ->toArray();

        $examQuestion->choices()
            ->whereNotIn('id', $submittedIds)
            ->delete();

        foreach ($validated['choices'] as $choiceData) {
            if (isset($choiceData['id'])) {
                $examQuestion->choices()->where('id', $choiceData['id'])->update([
                    'choice_text' => $choiceData['choice_text'],
                    'is_correct' => $choiceData['is_correct'],
                ]);
            } else {
                $examQuestion->choices()->create([
                    'choice_text' => $choiceData['choice_text'],
                    'is_correct' => $choiceData['is_correct'],
                ]);
            }
        }

        $examQuestion->load('choices');
        return response()->json($examQuestion);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($bank, $id)
    {
        $examQuestion = ExamBankQuestion::where('bank', $bank)->findOrFail($id);
        $examQuestion->choices()->delete(); // Ensure choices are deleted
        $examQuestion->delete();
        return response()->json(['message' => 'Question deleted']);
    }

    // You may omit unused scaffolded methods: create, show, edit
}