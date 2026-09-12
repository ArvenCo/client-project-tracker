<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/', [ProjectController::class, 'index'])->name('projects.page');
    Route::controller(ProjectController::class)->prefix('projects')->group(function(){
        Route::get('/', 'getProjects')->name('projects.all');
        Route::post('/', 'createProject')->name('project.create');
        Route::put('/{id}', 'updateProject')->name('project.update');
        Route::delete('/{id}', 'deleteProject')->name('project.delete');
    });

});

require __DIR__.'/settings.php';
