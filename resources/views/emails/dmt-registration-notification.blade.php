<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pendaftaran DMT Baru</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .info-box {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
        }
        .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #4b5563;
            display: inline-block;
            width: 150px;
        }
        .value {
            color: #111827;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Pendaftaran DMT Baru</h1>
    </div>
    
    <div class="content">
        <p>Halo Admin,</p>
        
        <p>Ada pendaftaran Disaster Medical Team (DMT) baru yang perlu ditinjau:</p>
        
        <div class="info-box">
            <div class="info-row">
                <span class="label">Nama DMT:</span>
                <span class="value">{{ $dmtData->nama_dmt }}</span>
            </div>
            <div class="info-row">
                <span class="label">Ketua Tim:</span>
                <span class="value">{{ $dmtData->nama_ketua_tim }}</span>
            </div>
            <div class="info-row">
                <span class="label">Bencana:</span>
                <span class="value">{{ $disaster->name }}</span>
            </div>
            <div class="info-row">
                <span class="label">Tanggal Kedatangan:</span>
                <span class="value">{{ $dmtData->tanggal_kedatangan->format('d/m/Y') }}</span>
            </div>
            <div class="info-row">
                <span class="label">Masa Penugasan:</span>
                <span class="value">{{ $dmtData->masa_penugasan_hari }} hari</span>
            </div>
            <div class="info-row">
                <span class="label">Nara Hubung:</span>
                <span class="value">{{ $dmtData->nama_nara_hubung }}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ $dmtData->email }}</span>
            </div>
            <div class="info-row">
                <span class="label">Nomor HP:</span>
                <span class="value">{{ $dmtData->nomor_hp }}</span>
            </div>
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">{{ ucfirst($dmtData->status_pendaftaran) }}</span>
            </div>
        </div>
        
        <p>Silakan login ke dashboard admin untuk melihat detail lengkap dan meninjau pendaftaran ini.</p>
        
        <a href="{{ url('/kelola-pendaftaran/' . $dmtData->id) }}" class="button">Lihat Detail Pendaftaran</a>
        
        <div class="footer">
            <p>Email ini dikirim secara otomatis dari sistem Pusat Komando Disaster Medical Team Kabupaten Agam.</p>
            <p>Jangan membalas email ini.</p>
        </div>
    </div>
</body>
</html>

