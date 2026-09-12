<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('projects/projects');
    }
    //
    public function getProjects()
    {
        return Project::orderByDesc('created_at')->get();
    }

    public function createProject(Request $request)
    {
        $validatedRequest = $request->validate([
            'client_name' => ['required', 'string', 'max:255'],
            'project_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:255'],
            'priority' => ['nullable', 'string', 'in:Low,Medium,High'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        Project::create($validatedRequest);

        return response()->noContent();
    }
}
