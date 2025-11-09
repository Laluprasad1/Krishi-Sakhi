import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  nameML: string;
  description: string;
  descriptionML: string;
  price: number;
  originalPrice?: number;
  category: 'seeds' | 'fertilizers' | 'tools' | 'pesticides' | 'organic' | 'equipment';
  categoryML: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  unit: string; // kg, piece, liter, etc.
  seller: string;
  rating: number;
  reviews: number;
  isOrganic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedUnit?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
}

interface MarketplaceContextType {
  // Products
  products: Product[];
  categories: Array<{id: string, name: string, nameML: string}>;
  
  // Cart functionality
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  
  // Order functionality
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Promise<string>;
  getOrderById: (orderId: string) => Order | undefined;
  
  // Admin functionality
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  getAllOrders: () => Order[];
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  
  // Search and filter
  searchProducts: (query: string) => Product[];
  filterProductsByCategory: (category: Product['category']) => Product[];
  getProductById: (productId: string) => Product | undefined;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Rice Seeds',
    nameML: 'ഓർഗാനിക് നെല്ല് വിത്ത്',
    description: 'High-quality organic rice seeds suitable for Kerala climate',
    descriptionML: 'കേരളത്തിലെ കാലാവസ്ഥയ്ക്ക് അനുയോജ്യമായ ഉയർന്ന നിലവാരമുള്ള ഓർഗാനിക് നെല്ല് വിത്ത്',
    price: 150,
    originalPrice: 200,
    category: 'seeds',
    categoryML: 'വിത്തുകൾ',
    image: '/api/placeholder/300/200',
    inStock: true,
    stockQuantity: 100,
    unit: 'kg',
    seller: 'Kerala Organic Farm',
    rating: 4.5,
    reviews: 25,
    isOrganic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Neem-based Pesticide',
    nameML: 'വേപ്പ് അടിസ്ഥാനമാക്കിയ കീടനാശിനി',
    description: 'Natural neem-based pesticide for organic farming',
    descriptionML: 'ജൈവ കൃഷിക്കായി പ്രകൃതിദത്തമായ വേപ്പ് അടിസ്ഥാനമാക്കിയ കീടനാശിനി',
    price: 320,
    category: 'pesticides',
    categoryML: 'കീടനാശിനികൾ',
    image: '/api/placeholder/300/200',
    inStock: true,
    stockQuantity: 50,
    unit: 'liter',
    seller: 'Bio Agro Solutions',
    rating: 4.2,
    reviews: 18,
    isOrganic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Coconut Fertilizer',
    nameML: 'തെങ്ങിന്റെ വളം',
    description: 'Specialized fertilizer for coconut trees',
    descriptionML: 'തെങ്ങിനായി പ്രത്യേകം തയ്യാറാക്കിയ വളം',
    price: 280,
    originalPrice: 350,
    category: 'fertilizers',
    categoryML: 'വളങ്ങൾ',
    image: '/api/placeholder/300/200',
    inStock: true,
    stockQuantity: 75,
    unit: 'kg',
    seller: 'Coconut Care',
    rating: 4.7,
    reviews: 32,
    isOrganic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const categories = [
  { id: 'seeds', name: 'Seeds', nameML: 'വിത്തുകൾ' },
  { id: 'fertilizers', name: 'Fertilizers', nameML: 'വളങ്ങൾ' },
  { id: 'tools', name: 'Tools', nameML: 'ഉപകരണങ്ങൾ' },
  { id: 'pesticides', name: 'Pesticides', nameML: 'കീടനാശിനികൾ' },
  { id: 'organic', name: 'Organic Products', nameML: 'ജൈവ ഉത്പന്നങ്ങൾ' },
  { id: 'equipment', name: 'Equipment', nameML: 'യന്ത്രങ്ങൾ' }
];

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('krishiSakhiProducts');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('krishiSakhiCart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('krishiSakhiOrders');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('krishiSakhiProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('krishiSakhiCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('krishiSakhiOrders', JSON.stringify(orders));
  }, [orders]);

  // Cart functionality
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Order functionality
  const createOrder = async (orderData: Partial<Order>): Promise<string> => {
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      customerId: orderData.customerId || '',
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      items: orderData.items || cart,
      totalAmount: orderData.totalAmount || getCartTotal(),
      shippingAddress: orderData.shippingAddress!,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      orderDate: new Date().toISOString(),
      ...orderData
    };

    setOrders(prev => [...prev, newOrder]);
    clearCart(); // Clear cart after order creation
    return orderId;
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  // Admin functionality
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, ...updates, updatedAt: new Date().toISOString() }
          : product
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const getAllOrders = () => {
    return orders;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, orderStatus: status } : order
      )
    );
  };

  // Search and filter functionality
  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.nameML.includes(query) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.descriptionML.includes(query)
    );
  };

  const filterProductsByCategory = (category: Product['category']) => {
    return products.filter(product => product.category === category);
  };

  const getProductById = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  const value: MarketplaceContextType = {
    products,
    categories,
    cart,
    orders,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    createOrder,
    getOrderById,
    addProduct,
    updateProduct,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    searchProducts,
    filterProductsByCategory,
    getProductById
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};