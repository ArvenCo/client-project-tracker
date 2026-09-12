<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    protected $RULES = [
        'client_name' => ['required', 'string', 'max:255'],
        'project_name' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'status' => ['nullable', 'string', 'max:255'],
        'priority' => ['nullable', 'string', 'in:Low,Medium,High'],
        'start_date' => ['nullable', 'date'],
        'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
    ];
    public function index()
    {
        return Inertia::render('projects/projects');
    }
    //
    public function getProjects(Request $request)
    {
        return Project::all();
    }

    public function projectPagination(Request $request)
    {
        $query = Project::query();
        $status = $request->input('status');
        $priority = $request->input('priority');
        $search = $request->input('search');
        $cursor = $request->input('cursor');

        $query->when(
            filled($status),
            fn($q) => $q->where('status', '=', $status)
        );

        $query->when(
            filled($priority),
            fn($q) => $q->where('priority', '=', $priority)
        );

        $query->when(filled($search), fn($q) =>
            $q->where('project_name', 'ILIKE', "%{$search}%")
            ->orWhere('client_name', 'ILIKE', "%{$search}%")
        );

        return $query->cursorPaginate(10, ['*'], 'cursor', $cursor);
    }

    public function getProject(int $id)
    {
        return Project::findOrFail($id);
    }

    public function createProject(Request $request)
    {
        $validatedRequest = $request->validate($this->RULES);

        Project::create($validatedRequest);

        return response()->noContent();
    }

    public function updateProject(int $id, Request $request)
    {
        $project = Project::findOrFail($id);
        $validatedRequest = $request->validate($this->RULES);
        $project->update($validatedRequest);

        return response()->noContent();
    }

    public function deleteProject(int $id, Request $request)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->noContent();
    }
}
