# Guía del Sistema de Variantes de Productos

## Descripción General

El sistema de variantes de productos de VELVET permite una gestión flexible y escalable de productos con múltiples opciones como tallas, colores, estilos, etc. Esta nueva arquitectura reemplaza el sistema anterior de arrays simples (`sizes[]`, `colors[]`) por un sistema más robusto basado en variantes y opciones.

## Estructura de la Base de Datos

### Tabla `products`
```sql
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  description text,
  price numeric NOT NULL,
  discount_price numeric,
  images text[] DEFAULT '{}',
  category_id uuid,
  subcategory_id uuid,
  stock integer DEFAULT 0, -- Stock base del producto
  featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  brand varchar,
  material text,
  care_instructions text,
  sku varchar UNIQUE,
  weight numeric,
  dimensions jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabla `product_variants`
```sql
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  sku varchar UNIQUE,
  price numeric NOT NULL, -- Precio específico de la variante
  stock integer DEFAULT 0, -- Stock específico de la variante
  weight numeric,
  dimensions jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabla `product_options`
```sql
CREATE TABLE public.product_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  title varchar NOT NULL, -- Ej: "Talla", "Color", "Material"
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabla `product_option_values`
```sql
CREATE TABLE public.product_option_values (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id uuid REFERENCES product_options(id),
  value varchar NOT NULL, -- Ej: "S", "Rojo", "Algodón"
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabla `variant_option_values`
```sql
CREATE TABLE public.variant_option_values (
  variant_id uuid REFERENCES product_variants(id),
  option_value_id uuid REFERENCES product_option_values(id),
  PRIMARY KEY (variant_id, option_value_id)
);
```

## Tipos de TypeScript Actualizados

```typescript
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  images: string[];
  category_id: string | null;
  subcategory_id: string | null;
  stock: number;
  featured: boolean;
  tags: string[];
  brand: string | null;
  material: string | null;
  care_instructions: string | null;
  sku: string | null;
  weight: number | null;
  dimensions: any | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  category?: Category;
  subcategory?: Category;
  variants?: ProductVariant[];
  options?: ProductOption[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  price: number;
  stock: number;
  weight: number | null;
  dimensions: any | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  option_values?: ProductOptionValue[];
};

export type ProductOption = {
  id: string;
  product_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  values?: ProductOptionValue[];
};

export type ProductOptionValue = {
  id: string;
  option_id: string;
  value: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  option?: ProductOption;
};
```

## Ejemplo de Uso en la Página de Producto

### 1. Carga de Datos
```typescript
const fetchProduct = async (productId: string) => {
  // Cargar producto base
  const { data: productData } = await supabase
    .from('products')
    .select(`*, categories(*)`)
    .eq('id', productId)
    .single();

  // Cargar variantes
  const { data: variantsData } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true);

  // Cargar opciones con valores
  const { data: optionsData } = await supabase
    .from('product_options')
    .select(`*, product_option_values(*)`)
    .eq('product_id', productId);

  // Combinar datos
  const product: Product = {
    ...productData,
    variants: variantsData || [],
    options: optionsData?.map(option => ({
      ...option,
      values: option.product_option_values || []
    })) || []
  };
};
```

### 2. Gestión de Estado
```typescript
const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

const handleOptionChange = (optionId: string, valueId: string) => {
  const newOptions = { ...selectedOptions, [optionId]: valueId };
  setSelectedOptions(newOptions);
  
  // Buscar variante que coincida con las opciones seleccionadas
  const matchingVariant = findVariantByOptions(newOptions);
  setSelectedVariant(matchingVariant);
};
```

### 3. Cálculo de Precios y Stock
```typescript
const getCurrentPrice = () => {
  if (selectedVariant) {
    return selectedVariant.price;
  }
  return product?.discount_price || product?.price || 0;
};

const getAvailableStock = () => {
  if (selectedVariant) {
    return selectedVariant.stock;
  }
  return product?.stock || 0;
};
```

### 4. Renderizado de Opciones
```tsx
{product.options?.map((option) => (
  <div key={option.id}>
    <h3 className="text-lg font-semibold">
      {option.title}: {selectedOptions[option.id] ? 
        option.values?.find(v => v.id === selectedOptions[option.id])?.value 
        : 'Seleccionar'}
    </h3>
    <div className="flex gap-2">
      {option.values?.map((value) => (
        <button
          key={value.id}
          onClick={() => handleOptionChange(option.id, value.id)}
          className={`px-4 py-2 border rounded ${
            selectedOptions[option.id] === value.id
              ? 'border-black bg-black text-white'
              : 'border-gray-300'
          }`}
        >
          {value.value}
        </button>
      ))}
    </div>
  </div>
))}
```

## Beneficios del Nuevo Sistema

### 1. Flexibilidad
- Soporte para cualquier tipo de opción (talla, color, material, estilo, etc.)
- Múltiples opciones por producto
- Precios específicos por variante

### 2. Escalabilidad
- Estructura normalizada en base de datos
- Fácil adición de nuevas opciones
- Gestión eficiente de stock por variante

### 3. Consistencia
- Tipado estricto con TypeScript
- Validación a nivel de base de datos
- Interfaz uniforme para todas las opciones

### 4. Rendimiento
- Consultas optimizadas
- Carga selectiva de datos
- Cache eficiente de opciones

## Migración del Sistema Anterior

Para migrar productos existentes con arrays `sizes[]` y `colors[]`:

1. **Crear opciones base:**
```sql
-- Insertar opción "Talla"
INSERT INTO product_options (product_id, title) 
VALUES ('product-id', 'Talla');

-- Insertar opción "Color"
INSERT INTO product_options (product_id, title) 
VALUES ('product-id', 'Color');
```

2. **Crear valores de opciones:**
```sql
-- Insertar valores de talla
INSERT INTO product_option_values (option_id, value)
SELECT option_id, unnest(sizes) FROM products 
JOIN product_options ON products.id = product_options.product_id
WHERE product_options.title = 'Talla';
```

3. **Crear variantes:**
```sql
-- Crear variantes para cada combinación
INSERT INTO product_variants (product_id, price, stock)
SELECT id, price, stock FROM products;
```

4. **Vincular opciones con variantes:**
```sql
-- Asociar valores de opciones con variantes según la lógica de negocio
```

## Consideraciones de Rendimiento

1. **Índices recomendados:**
```sql
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_options_product_id ON product_options(product_id);
CREATE INDEX idx_variant_option_values_variant_id ON variant_option_values(variant_id);
```

2. **Consultas optimizadas:**
- Usar `SELECT` específicos en lugar de `*`
- Implementar paginación para listados grandes
- Cache de opciones frecuentemente consultadas

3. **Estrategia de carga:**
- Cargar opciones por demanda
- Precargar variantes activas
- Lazy loading para imágenes de variantes

Esta nueva arquitectura proporciona una base sólida y escalable para el manejo de productos con múltiples variantes en VELVET.
