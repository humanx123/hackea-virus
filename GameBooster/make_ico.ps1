Add-Type -AssemblyName System.Drawing

function New-GameBoosterIcon {
    param([int]$Size)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Fondo: hexágono oscuro con borde verde
    $center = $Size / 2.0
    $outer = $center * 0.98
    $hexPts = @()
    for ($i = 0; $i -lt 6; $i++) {
        $angle = ($i * 60 - 30) * [Math]::PI / 180.0
        $x = $center + $outer * [Math]::Cos($angle)
        $y = $center + $outer * [Math]::Sin($angle)
        $hexPts += New-Object System.Drawing.PointF([float]$x, [float]$y)
    }

    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 25, 35))
    $g.FillPolygon($darkBrush, $hexPts)

    $greenPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(0, 230, 115), [Math]::Max(2.0, $Size * 0.06))
    $g.DrawPolygon($greenPen, $hexPts)

    # Rayo (bolt) en el centro
    $inner = $center * 0.62
    $boltPts = @(
        (New-Object System.Drawing.PointF([float]($center + $inner * 0.10), [float]($center - $inner))),
        (New-Object System.Drawing.PointF([float]($center - $inner * 0.55), [float]($center + $inner * 0.25))),
        (New-Object System.Drawing.PointF([float]($center - $inner * 0.05), [float]($center + $inner * 0.25))),
        (New-Object System.Drawing.PointF([float]($center - $inner * 0.30), [float]($center + $inner))),
        (New-Object System.Drawing.PointF([float]($center + $inner * 0.55), [float]($center - $inner * 0.20))),
        (New-Object System.Drawing.PointF([float]($center + $inner * 0.05), [float]($center - $inner * 0.20)))
    )
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 230, 115))
    $g.FillPolygon($greenBrush, $boltPts)

    $g.Dispose()
    return $bmp
}

$pngs = @()
foreach ($sz in @(16, 24, 32, 48, 64, 128, 256)) {
    $bmp = New-GameBoosterIcon -Size $sz
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $pngs += ,([byte[]]$ms.ToArray())
    $ms.Dispose()
}

# Empaquetar como .ico multi-tamaño
$msIco = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($msIco)

$bw.Write([uint16]0)             # reserved
$bw.Write([uint16]1)             # type: icon
$bw.Write([uint16]$pngs.Count)   # count

$offset = 6 + ($pngs.Count * 16)
$sizes = @(16, 24, 32, 48, 64, 128, 256)
for ($i = 0; $i -lt $pngs.Count; $i++) {
    $bw.Write([byte]($(if ($sizes[$i] -eq 256) { 0 } else { $sizes[$i] })))  # width (256 -> 0)
    $bw.Write([byte]($(if ($sizes[$i] -eq 256) { 0 } else { $sizes[$i] })))  # height
    $bw.Write([byte]0)   # colors
    $bw.Write([byte]0)   # reserved
    $bw.Write([uint16]1) # planes
    $bw.Write([uint16]32)# bpp
    $bw.Write([uint32]$pngs[$i].Length)
    $bw.Write([uint32]$offset)
    $offset += $pngs[$i].Length
}

foreach ($p in $pngs) { $bw.Write($p) }
$bw.Flush()

$outPath = "C:\Users\fidel\.claude\worktrees\game-booster\GameBooster\game.ico"
[System.IO.File]::WriteAllBytes($outPath, $msIco.ToArray())
$bw.Dispose()
$msIco.Dispose()
Write-Host "Icono creado: $outPath ($([System.IO.FileInfo]::new($outPath).Length) bytes)"