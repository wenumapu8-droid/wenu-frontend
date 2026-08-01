# KODEX Effect Recipes

## Liquid Acid

```text
domain warp
+ FBM
+ contour bands
+ restricted cyan/red/orange palette
+ light temporal feedback
```

Recommended:

```text
feedback 0.10–0.22
grain 0.025–0.05
CRT 0.25–0.55
```

## Archive CRT

```text
archive orbit scene
+ CRT 0.65
+ dither 0.18
+ RGB split 0.8 px
+ grain 0.035
```

## ASCII Signal State

```text
ASCII 1.0
cell 9–14 px desktop
cell 7–10 px mobile
CRT 0.35
dither 0.08
feedback 0.06
```

Reduce ASCII resolution before shrinking the glyph cell below readable size.

## Error State

```text
threshold portal
+ accent red
+ CRT 0.8
+ RGB split 2.4 px
+ feedback 0.25
+ 120–180 ms DOM glitch event
```

Do not run the high glitch continuously.

## Low-power mobile

```text
DPR 0.75–1
feedback <= 0.08
grain <= 0.025
ASCII off unless it is the scene concept
audio analyser 512–1024 FFT
```
