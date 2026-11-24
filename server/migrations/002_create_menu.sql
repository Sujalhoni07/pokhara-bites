-- 002: the café's own menu (replaces the DummyJSON test data)

CREATE TABLE menu_categories (
  id         INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       VARCHAR(40) NOT NULL UNIQUE,
  sort_order SMALLINT    NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id           INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id  INTEGER      NOT NULL REFERENCES menu_categories (id) ON DELETE RESTRICT,
  name         VARCHAR(80)  NOT NULL UNIQUE,
  description  VARCHAR(300) NOT NULL,
  price        INTEGER      NOT NULL CHECK (price > 0),   -- whole rupees, never a decimal
  is_veg       BOOLEAN      NOT NULL DEFAULT false,
  is_popular   BOOLEAN      NOT NULL DEFAULT false,
  is_available BOOLEAN      NOT NULL DEFAULT true,       -- false = hidden from customers
  image_url    TEXT,
  ingredients  TEXT[]       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX menu_items_category_id_idx ON menu_items (category_id);

-- Starting menu: the café's real dishes
INSERT INTO menu_categories (name, sort_order) VALUES
  ('Nepali Specials', 1),
  ('Beverages', 2),
  ('Desserts', 3);

INSERT INTO menu_items (category_id, name, description, price, is_veg, is_popular, image_url, ingredients)
SELECT c.id, d.name, d.description, d.price, d.is_veg, d.is_popular, d.image_url, d.ingredients
FROM (VALUES
  ('Nepali Specials', 'Chicken Momo', 'Juicy steamed chicken dumplings with spicy tomato achar.', 250, false, true,
   '/images/momo.jpg', ARRAY['Minced chicken', 'Onion', 'Garlic', 'Ginger', 'Momo wrappers', 'Tomato achar']),
  ('Nepali Specials', 'Thakali Set', 'Rice, dal, gundruk, pickle and chicken curry.', 550, false, true,
   '/images/thakali.jpg', ARRAY['Steamed rice', 'Black lentil dal', 'Chicken curry', 'Gundruk', 'Seasonal greens', 'Pickle']),
  ('Nepali Specials', 'Chicken Chowmein', 'Stir-fried noodles with fresh vegetables and chicken.', 220, false, false,
   '/images/chowmein.jpg', ARRAY['Noodles', 'Chicken strips', 'Cabbage', 'Carrot', 'Spring onion', 'Soy sauce']),
  ('Nepali Specials', 'Veg Thukpa', 'Warm Himalayan noodle soup, perfect for a cold evening.', 240, true, false,
   '/images/thukpa.jpg', ARRAY['Noodles', 'Vegetable broth', 'Carrot', 'Cabbage', 'Tomato', 'Coriander']),
  ('Beverages', 'Café Latte', 'Smooth espresso with silky steamed milk.', 220, true, true,
   '/images/coffee.jpg', ARRAY['Freshly roasted Nepali coffee beans', 'Milk']),
  ('Beverages', 'Masala Milk Tea', 'Nepali chiya with ginger, cardamom and fresh milk.', 80, true, false,
   '/images/milk-tea.jpg', ARRAY['Black tea', 'Milk', 'Ginger', 'Cardamom', 'Sugar']),
  ('Desserts', 'Chocolate Cake', 'Rich, moist chocolate cake baked fresh every morning.', 280, false, false,
   '/images/cake.jpg', ARRAY['Flour', 'Cocoa powder', 'Eggs', 'Butter', 'Sugar', 'Dark chocolate'])
) AS d (category, name, description, price, is_veg, is_popular, image_url, ingredients)
JOIN menu_categories c ON c.name = d.category;