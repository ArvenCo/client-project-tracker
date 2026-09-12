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
        return Project::all();
    }
}
