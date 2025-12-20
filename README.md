# Bootstrap more like Tailwind


> Documentation on how to use the hover, focus, action parameters, and new transition classes will be added soon.


This repository is an overlay for the standard Bootstrap version that adds more powerful utilities for managing colors and styles in elements, inspired by a Tailwind-like approach.

## List of changes

- [Colors](#colors)
- [Alerts](#alerts)
- [Backgrounds](#backgrounds)
- [Borders](#borders)
- [Buttons](#buttons)
- [Links](#links)
- [Shadows](#shadows)
- [Texts](#texts)
- [Texts with a background](#texts-with-a-background)
- [Font sizes](#font-sizes)
- [Cursors](#cursors)
- [Display](#displays)

## Documentation

### Colors

The elements described below use the default Bootstrap color palette.  
All colors are available in the format `<color_name>-<color_weight>`.

Each color has weights in the range from `100` to `900`.

Available colors:

- blues `#0d6efd`
- indigos `#6610f2`
- purples `#6f42c1`
- pinks `#d63384`
- reds `#dc3545`
- oranges `#fd7e14`
- yellows `#ffc107`
- greens `#198754`
- teals `#20c997`
- cyans `#0dcaf0`
- grays `#6c757d`

Additionally, many elements support **theme-based color management**.  
To use this feature, prefix the class with `light:` or `dark:`.

You can combine them freely to create separate styles for each theme.

This version also provides a **SCSS mixin** that simplifies theme handling and allows you to define custom variations.

```scss
@mixin theme($type: dark) {
  [data-bs-theme="#{$type}"] {
    @content;
  }
}
```

### Alerts

>Basic 
> - `alert-<color_name>-<color_weight>`
>```html
><div class="alert alert-blue-500" role="alert">></div>
>```

>Theme-based
> - `<theme_name>:alert-<color_name>-<color_weight>`
>```html
><div class="alert light:alert-blue-500" role="alert">></div>
>```
>```html
><div class="alert dark:alert-blue-500" role="alert"></div>
>```

### Backgrounds

>Basic 
> - `bg-<color_name>-<color_weight>`
>```html
><div class="bg-blue-500"></div>
>```

>Theme-based
> - `<theme_name>:bg-<color_name>-<color_weight>`
>```html
><div class="light:bg-blue-500"></div>
>```
>```html
><div class="dark:bg-blue-500"></div>
>```

### Borders

>Basic 
> - `border-<color_name>-<color_weight>`
> - `border-<side>-<color_name>-<color_weight>`
>```html
><div class="border-blue-500"></div>
>```
>```html
><div class="border-top-blue-500"></div>
>```

>Theme-based
> - `<theme_name>:border-<color_name>-<color_weight>`
> - `<theme_name>:border-<side>-<color_name>-<color_weight>`
>```html
><div class="light:border-blue-500"></div>
>```
>```html
><div class="dark:border-top-blue-500"></div>
>```

### Buttons

>Basic 
> - `btn-<color_name>-<color_weight>`
> - `btn-outline-<color_name>-<color_weight>`
>```html
><button class="btn btn-blue-500"></button>
>```
>```html
><button class="btn btn-outline-blue-500"></button>
>```

>Theme-based
> - `<theme_name>:btn-<color_name>-<color_weight>`
> - `<theme_name>:btn-outline-<color_name>-<color_weight>`
>```html
><button class="btn light:btn-blue-500"></button>
>```
>```html
><button class="btn dark:btn-outline-top-blue-500"></button>
>```

### Links

>Basic 
> - `link-<color_name>-<color_weight>`
>```html
><a class="link-blue-500"></a>
>```

>Theme-based
> - `<theme_name>:link-<color_name>-<color_weight>`
>```html
><a class="light:link-blue-500"></a>
>```
>```html
><a class="dark:link-blue-500"></a>
>```

### Shadows

>Basic 
> - `shadow-<color_name>-<color_weight>`
> - `shadow-<size>-<color_name>-<color_weight>`
>```html
><div class="shadow-blue-500"></div>
>```
>```html
><div class="shadow-lg-blue-500"></div>
>```

>Theme-based
> - `<theme_name>:shadow-<color_name>-<color_weight>`
> - `<theme_name>:shadow-<size>-<color_name>-<color_weight>`
>```html
><div class="light:shadow-blue-500"></div>
>```
>```html
><div class="dark:shadow-lg-top-blue-500"></div>
>```

### Texts

>Basic 
> - `text-<color_name>-<color_weight>`
>```html
><p class="text-blue-500"></p>
>```

>Theme-based
> - `<theme_name>:text-<color_name>-<color_weight>`
>```html
><p class="light:text-blue-500"></p>
>```
>```html
><p class="dark:text-blue-500"></p>
>```

### Texts with a background

>Basic 
> - `text-bg-<color_name>-<color_weight>`
> - `text-bg-outline-<color_name>-<color_weight>`
>```html
><span class="badge text-bg-blue-500"></span>
>```
>```html
><span class="badge text-bg-outline-blue-500"></span>
>```

>Theme-based
> - `<theme_name>:text-bg-<color_name>-<color_weight>`
> - `<theme_name>:text-bg-outline-<color_name>-<color_weight>`
>```html
><span class="badge light:text-bg-blue-500"></span>
>```
>```html
><span class="badge dark:text-bg-outline-blue-500"></span>
>```

### Font sizes

In this case, `font_size` is available from 8 to 100.

>Basic 
> - `fs-<breakpoint>-<size>`
> - `fs-[<font_size>px]` 
> - `fs-<breakpoint>-[<font_size>px]`
>```html
><p class="fs-md-4"></p>
>```
>```html
><p class="fs-[16px]"></p>
>```
>```html
><p class="fs-md-[16px]"></p>
>```

>Theme-based
> - `<theme_name>:fs-<breakpoint>-<size>`
> - `<theme_name>:fs-[<font_size>px]`
> - `<theme_name>:fs-<breakpoint>-[<font_size>px]`
>```html
><p class="light:fs-md-4"></p>
>```
>```html
><p class="dark:fs-[16px]"></p>
>```
>```html
><p class="light:fs-md-[16px]"></p>
>```

### Cursors

>Basic 
> - `cursor-<type>`
> - `cursor-<breakpoint>-<type>`
>```html
><p class="cursor-pointer"></p>
>```
>```html
><p class="cursor-md-pointer"></p>
>```

>Theme-based
> - `<theme_name>:cursor-<type>`
> - `<theme_name>:cursor-<breakpoint>-<type>`
>```html
><p class="light:cursor-pointer"></p>
>```
>```html
><p class="dark:cursor-md-pointer"></p>
>```

### Displays

>Theme-based
> - `<theme_name>:d-<type>`
> - `<theme_name>:d-<breakpoint>-<type>`
>```html
><div class="light:d-none"></div>
>```
>```html
><div class="dark:d-md-none"></div>
>```