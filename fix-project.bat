@echo off
echo ==========================================
echo  CORRECTION COMPLETE DU PROJET
echo ==========================================
echo.

echo 1. Suppression des anciens fichiers...
rmdir /s /q node_modules 2>nul
rmdir /s /q .next 2>nul
del package-lock.json 2>nul

echo 2. Installation des dépendances correctes...
call npm install @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-toggle @radix-ui/react-toggle-group

echo.
echo 3. Correction des imports dans tous les fichiers...
echo.

:: Correction des fichiers qui importent "radix-ui"
powershell -Command "
$files = Get-ChildItem -Recurse -Include *.tsx,*.ts | Where-Object { $_ -notmatch 'node_modules' } | Select-String -Pattern 'from \"radix-ui\"' | Select-Object -ExpandProperty Path -Unique
foreach ($file in $files) {
    Write-Host 'Correction de' $file -ForegroundColor Yellow
    $content = Get-Content $file -Raw
    $content = $content -replace 'import \{ Label as LabelPrimitive \} from \"radix-ui\"', 'import * as LabelPrimitive from \"@radix-ui/react-label\"'
    $content = $content -replace 'import \{ Slot \} from \"radix-ui\"', 'import { Slot } from \"@radix-ui/react-slot\"'
    $content = $content -replace 'import \{ Dialog \} from \"radix-ui\"', 'import * as Dialog from \"@radix-ui/react-dialog\"'
    $content = $content -replace 'import \{ Select \} from \"radix-ui\"', 'import * as Select from \"@radix-ui/react-select\"'
    $content = $content -replace 'import \{ DropdownMenu \} from \"radix-ui\"', 'import * as DropdownMenu from \"@radix-ui/react-dropdown-menu\"'
    $content = $content -replace 'import \{ Tabs \} from \"radix-ui\"', 'import * as Tabs from \"@radix-ui/react-tabs\"'
    $content = $content -replace 'import \{ Toast \} from \"radix-ui\"', 'import * as Toast from \"@radix-ui/react-toast\"'
    $content = $content -replace 'import \{ Tooltip \} from \"radix-ui\"', 'import * as Tooltip from \"@radix-ui/react-tooltip\"'
    $content = $content -replace 'import \{ Popover \} from \"radix-ui\"', 'import * as Popover from \"@radix-ui/react-popover\"'
    Set-Content -Path $file -Value $content -NoNewline
    Write-Host '✅' $file 'corrigé' -ForegroundColor Green
}
"

echo.
echo 4. Verification finale...
call npm run build

echo.
echo ==========================================
echo  CORRECTION TERMINEE !
echo ==========================================
pause