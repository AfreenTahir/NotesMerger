New-Item -ItemType Directory -Force -Path .\src-tauri\icons | Out-Null
Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 64, 128, 256)
$entries = @()
$dataOffset = 6 + (16 * $sizes.Count)

foreach ($size in $sizes) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $tealColor = [System.Drawing.Color]::FromArgb(7, 152, 137)
  $stroke = [single]([Math]::Max(1.8, $size * 0.0625))
  $thinStroke = [single]([Math]::Max(1.5, $size * 0.05))
  $pen = New-Object System.Drawing.Pen $tealColor, $stroke
  $thinPen = New-Object System.Drawing.Pen $tealColor, $thinStroke
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $thinPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $thinPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $thinPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $scale = $size / 256
  function P($x, $y) {
    New-Object System.Drawing.PointF ([single]($x * $scale)), ([single]($y * $scale))
  }

  $graphics.DrawLines($pen, @((P 58 31), (P 148 31), (P 199 82), (P 199 158)))
  $graphics.DrawLines($pen, @((P 148 32), (P 148 82), (P 197 82)))
  $graphics.DrawLines($pen, @((P 58 31), (P 58 219), (P 118 219)))
  $graphics.DrawLine($pen, (P 86 113), (P 137 113))
  $graphics.DrawLine($pen, (P 86 145), (P 124 145))
  $graphics.DrawEllipse($pen, ([single](117 * $scale)), ([single](128 * $scale)), ([single](86 * $scale)), ([single](86 * $scale)))
  $graphics.DrawLine($pen, (P 191 202), (P 222 233))
  $graphics.DrawLine($thinPen, (P 141 161), (P 178 161))
  $graphics.DrawLine($thinPen, (P 141 181), (P 172 181))

  $stream = New-Object System.IO.MemoryStream
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $bytes = $stream.ToArray()
  $entries += [PSCustomObject]@{
    Size = $size
    Bytes = $bytes
    Offset = $dataOffset
  }
  $dataOffset += $bytes.Length

  $stream.Dispose()
  $pen.Dispose()
  $thinPen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$iconPath = Join-Path (Resolve-Path .\src-tauri\icons).Path "icon.ico"
$file = [System.IO.File]::Create($iconPath)
$writer = New-Object System.IO.BinaryWriter $file
$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]$entries.Count)

foreach ($entry in $entries) {
  $dimension = if ($entry.Size -eq 256) { 0 } else { $entry.Size }
  $writer.Write([Byte]$dimension)
  $writer.Write([Byte]$dimension)
  $writer.Write([Byte]0)
  $writer.Write([Byte]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]32)
  $writer.Write([UInt32]$entry.Bytes.Length)
  $writer.Write([UInt32]$entry.Offset)
}

foreach ($entry in $entries) {
  $writer.Write($entry.Bytes)
}

$writer.Close()
Get-Item $iconPath | Select-Object FullName, Length
