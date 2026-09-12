<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $jsonPath = base_path('database/assets/test_data.json');

        if (!File::exists($jsonPath)) {
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        if (!is_array($data)) {
            return;
        }

        $records = [];
        foreach ($data as $item) {
            $records[] = [
                'id' => $item['id'],
                'client_name' => $item['clientName'],
                'project_name' => $item['projectName'],
                'description' => $item['description'],
                'status' => $item['status'],
                'priority' => $item['priority'],
                'start_date' => $item['startDate'],
                'due_date' => $item['dueDate'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($records === []) {
            return;
        }

        DB::table('projects')->upsert($records, ['id']);

        DB::statement("SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 0), true)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('projects')->whereIn('id', array_map(fn (array $row) => $row['id'], $records ?? []))->delete();
    }
};
