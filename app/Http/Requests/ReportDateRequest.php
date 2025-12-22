<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportDateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only authenticated users can upload
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'report_link_id' => 'required|exists:report_links,id',
            'files' => 'required|array',
            'files.*' => 'file|mimes:pdf|max:2048', // Each file: PDF only, max 2MB
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'date.required' => 'Tanggal harus diisi.',
            'date.date' => 'Format tanggal tidak valid.',
            'report_link_id.required' => 'Report link harus dipilih.',
            'report_link_id.exists' => 'Report link tidak ditemukan.',
            'files.required' => 'File harus diupload.',
            'files.array' => 'Format file tidak valid.',
            'files.*.file' => 'File tidak valid.',
            'files.*.mimes' => 'Setiap file harus berformat PDF.',
            'files.*.max' => 'Ukuran setiap file maksimal 2MB.',
        ];
    }
}
