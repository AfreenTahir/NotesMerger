$sourcePath = Resolve-Path .\frontend\assets\logo.png
$iconDir = Resolve-Path .\src-tauri\icons
$iconPath = Join-Path $iconDir.Path "icon.ico"

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Image]::FromFile($sourcePath.Path)
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

  $padding = [Math]::Max(1, [Math]::Floor($size * 0.08))
  $available = $size - ($padding * 2)
  $scale = [Math]::Min($available / $source.Width, $available / $source.Height)
  $drawWidth = [Math]::Max(1, [Math]::Floor($source.Width * $scale))
  $drawHeight = [Math]::Max(1, [Math]::Floor($source.Height * $scale))
  $x = [Math]::Floor(($size - $drawWidth) / 2)
  $y = [Math]::Floor(($size - $drawHeight) / 2)
  $graphics.DrawImage($source, $x, $y, $drawWidth, $drawHeight)

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
  $graphics.Dispose()
  $bitmap.Dispose()
}

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
$source.Dispose()
Get-Item $iconPath | Select-Object FullName, Length
