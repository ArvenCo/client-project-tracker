<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Summary of Project
 * @property int $id,
 * @property string $client_name,
 * @property string $project_name,
 * @property string|null $description,
 * @property string|null $status,
 * @property string|null $priority,
 * @property Carbon|null $start_date,
 * @property Carbon|null $due_date,
 * @property Carbon $created_at,
 * @property Carbon $updated_at,
 */
#[Fillable(['client_name', 'project_name', 'description', 'status', 'priority', 'start_date', 'due_date'])]
class Project extends Model
{
    //
}
