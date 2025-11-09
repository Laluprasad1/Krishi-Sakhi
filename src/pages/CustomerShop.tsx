import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  Filter,
  Star,
  IndianRupee,
  User,
  LogOut,
  Package,
  Truck,
  CheckCircle,
  Heart,
  Eye,
  ShoppingBag,
  CreditCard,
  MapPin
} from 'lucide-react';
import { useMarketplace, Product, CartItem } from '@/contexts/MarketplaceContext';

interface CustomerShopProps {
  customer: any;
  onLogout: () => void;
  currentLang: boolean;
}

export default function CustomerShop({ customer, onLogout, currentLang }: CustomerShopProps) {
  const {
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
    searchProducts,
    filterProductsByCategory
  } = useMarketplace();

  const [activeView, setActiveView] = useState<'products' | 'cart' | 'checkout' | 'orders'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Checkout state
  const [shippingAddress, setShippingAddress] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    address: '',
    city: '',
    state: 'Kerala',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Filter products based on search and category
  React.useEffect(() => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = searchProducts(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const handleAddToCart = (product: Product, qty: number) => {
    addToCart(product, qty);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessingOrder(true);
    
    try {
      const orderId = await createOrder({
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        items: cart,
        totalAmount: getCartTotal(),
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'pending'
      });
      
      alert(currentLang 
        ? `ഓർഡർ വിജയകരമായി സ്ഥാപിച്ചു! ഓർഡർ ഐഡി: ${orderId}`
        : `Order placed successfully! Order ID: ${orderId}`
      );
      
      setActiveView('products');
      
    } catch (error) {
      alert(currentLang 
        ? 'ഓർഡർ സ്ഥാപിക്കുന്നതിൽ പ്രശ്‌നം'
        : 'Failed to place order'
      );
    }
    
    setIsProcessingOrder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-green-800">
                {currentLang ? 'കൃഷി സഖി മാർക്കറ്റ്‌പ്ലേസ്' : 'Krishi Sakhi Marketplace'}
              </h1>
              <div className="hidden md:flex gap-2">
                <Button 
                  variant={activeView === 'products' ? 'default' : 'ghost'}
                  onClick={() => setActiveView('products')}
                  size="sm"
                >
                  <Package className="h-4 w-4 mr-1" />
                  {currentLang ? 'ഉത്പന്നങ്ങൾ' : 'Products'}
                </Button>
                <Button 
                  variant={activeView === 'orders' ? 'default' : 'ghost'}
                  onClick={() => setActiveView('orders')}
                  size="sm"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  {currentLang ? 'എന്റെ ഓർഡറുകൾ' : 'My Orders'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <Button
                variant={activeView === 'cart' ? 'default' : 'outline'}
                onClick={() => setActiveView('cart')}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {currentLang ? 'കാർട്ട്' : 'Cart'}
                {getCartItemsCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs">
                    {getCartItemsCount()}
                  </Badge>
                )}
              </Button>
              
              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-gray-600">{customer.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Products View */}
        {activeView === 'products' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={currentLang ? 'ഉത്പന്നങ്ങൾ തിരയുക...' : 'Search products...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{currentLang ? 'എല്ലാ വിഭാഗങ്ങളും' : 'All Categories'}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {currentLang ? category.nameML : category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2">
                      {product.isOrganic && (
                        <Badge className="bg-green-600">
                          {currentLang ? 'ഓർഗാനിക്' : 'Organic'}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      {!product.inStock && (
                        <Badge variant="secondary">
                          {currentLang ? 'സ്റ്റോക്കില്ല' : 'Out of Stock'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {currentLang ? product.nameML : product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {currentLang ? product.descriptionML : product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.stockQuantity} {product.unit} {currentLang ? 'ബാക്കി' : 'left'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">per {product.unit}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            {currentLang ? 'കാണുക' : 'View'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{currentLang ? product.nameML : product.name}</DialogTitle>
                            <DialogDescription>
                              {currentLang ? product.descriptionML : product.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">
                                  {currentLang ? 'വില' : 'Price'}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold flex items-center">
                                    <IndianRupee className="h-5 w-5" />
                                    {product.price}
                                  </span>
                                  <span className="text-sm text-gray-500">per {product.unit}</span>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">
                                  {currentLang ? 'അളവ്' : 'Quantity'}
                                </h4>
                                <div className="flex items-center gap-3">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-12 text-center">{quantity}</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setQuantity(quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="pt-4">
                                <Button 
                                  onClick={() => handleAddToCart(product, quantity)}
                                  disabled={!product.inStock}
                                  className="w-full"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  {currentLang ? 'കാർട്ടിൽ ചേർക്കുക' : 'Add to Cart'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product, 1)}
                        disabled={!product.inStock}
                        className="flex-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {currentLang ? 'കാർട്ട്' : 'Cart'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentLang ? 'ഉത്പന്നങ്ങളൊന്നും കണ്ടെത്തിയില്ല' : 'No products found'}
                </h3>
                <p className="text-gray-600">
                  {currentLang 
                    ? 'വ്യത്യസ്ത കീവേഡുകൾ ഉപയോഗിച്ച് തിരയുക അല്ലെങ്കിൽ ഫിൽട്ടറുകൾ മാറ്റുക'
                    : 'Try different keywords or change filters'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cart View */}
        {activeView === 'cart' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {currentLang ? 'എന്റെ കാർട്ട്' : 'My Cart'}
              </CardTitle>
              <CardDescription>
                {cart.length === 0 
                  ? (currentLang ? 'നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്' : 'Your cart is empty')
                  : `${getCartItemsCount()} ${currentLang ? 'ഇനങ്ങൾ' : 'items'} - ${currentLang ? 'മൊത്തം' : 'Total'}: ₹${getCartTotal()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentLang ? 'നിങ്ങളുടെ കാർട്ട് ശൂന്യമാണ്' : 'Your cart is empty'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {currentLang 
                      ? 'ഷോപ്പിംഗ് തുടങ്ങാൻ ഉത്പന്നങ്ങൾ ചേർക്കുക'
                      : 'Add products to start shopping'
                    }
                  </p>
                  <Button onClick={() => setActiveView('products')}>
                    {currentLang ? 'ഷോപ്പിംഗ് തുടരുക' : 'Continue Shopping'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{currentLang ? item.nameML : item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {currentLang ? item.categoryML : item.category}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <IndianRupee className="h-4 w-4" />
                          <span className="font-medium">{item.price}</span>
                          <span className="text-sm text-gray-500">per {item.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {item.price * item.quantity}
                        </p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          {currentLang ? 'നീക്കം ചെയ്യുക' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">
                        {currentLang ? 'മൊത്തം' : 'Total'}:
                      </span>
                      <span className="text-2xl font-bold flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {getCartTotal()}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={clearCart} className="flex-1">
                        {currentLang ? 'കാർട്ട് ക്ലിയർ ചെയ്യുക' : 'Clear Cart'}
                      </Button>
                      <Button onClick={() => setActiveView('checkout')} className="flex-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {currentLang ? 'ചെക്ക്ഔട്ട്' : 'Checkout'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Checkout View */}
        {activeView === 'checkout' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {currentLang ? 'ഷിപ്പിംഗ് വിലാസം' : 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{currentLang ? 'പേര്' : 'Name'}</Label>
                    <Input
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{currentLang ? 'ഫോൺ' : 'Phone'}</Label>
                    <Input
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>{currentLang ? 'വിലാസം' : 'Address'}</Label>
                  <Textarea
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>{currentLang ? 'നഗരം' : 'City'}</Label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{currentLang ? 'സംസ്ഥാനം' : 'State'}</Label>
                    <Input
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{currentLang ? 'പിൻകോഡ്' : 'Pincode'}</Label>
                    <Input
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>{currentLang ? 'പേയ്‌മെന്റ് രീതി' : 'Payment Method'}</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'cod' | 'online') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">
                        {currentLang ? 'ക്യാഷ് ഓൺ ഡെലിവറി' : 'Cash on Delivery'}
                      </SelectItem>
                      <SelectItem value="online">
                        {currentLang ? 'ഓൺലൈൻ പേയ്‌മെന്റ്' : 'Online Payment'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{currentLang ? 'ഓർഡർ സംഗ്രഹം' : 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{currentLang ? item.nameML : item.name} x{item.quantity}</span>
                      <span className="flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>{currentLang ? 'മൊത്തം' : 'Total'}:</span>
                      <span className="flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {getCartTotal()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 space-y-3">
                  <Button 
                    onClick={handleCheckout}
                    disabled={isProcessingOrder || cart.length === 0}
                    className="w-full"
                  >
                    {isProcessingOrder ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {currentLang ? 'ഓർഡർ സ്ഥാപിക്കുന്നു...' : 'Placing Order...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {currentLang ? 'ഓർഡർ സ്ഥാപിക്കുക' : 'Place Order'}
                      </div>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveView('cart')} className="w-full">
                    {currentLang ? 'കാർട്ടിലേക്ക് മടങ്ങുക' : 'Back to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders View */}
        {activeView === 'orders' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {currentLang ? 'എന്റെ ഓർഡറുകൾ' : 'My Orders'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const customerOrders = orders.filter(order => order.customerId === customer?.id);
                
                if (customerOrders.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">
                        {currentLang 
                          ? 'നിങ്ങളുടെ ഓർഡർ ചരിത്രം ഇവിടെ ദൃശ്യമാകും'
                          : 'No orders found. Start shopping to see your orders here!'
                        }
                      </p>
                      <Button 
                        onClick={() => setActiveView('products')} 
                        className="mt-4"
                        variant="outline"
                      >
                        {currentLang ? 'കടയിലേക്ക് പോകുക' : 'Start Shopping'}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {customerOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {currentLang ? 'ഓർഡർ #' : 'Order #'}{order.id.slice(-6)}
                              </CardTitle>
                              <CardDescription>
                                {new Date(order.orderDate).toLocaleDateString(currentLang ? 'ml-IN' : 'en-IN')}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant={
                                order.orderStatus === 'delivered' ? 'default' :
                                order.orderStatus === 'cancelled' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {currentLang 
                                ? {
                                    'pending': 'പെൻഡിംഗ്',
                                    'confirmed': 'സ്ഥിരീകരിച്ചു',
                                    'processing': 'പ്രോസസ്സിംഗ്',
                                    'shipped': 'അയച്ചു',
                                    'delivered': 'ഡെലിവർ ചെയ്തു',
                                    'cancelled': 'റദ്ദാക്കി'
                                  }[order.orderStatus]
                                : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
                              }
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {currentLang ? 'മൊത്തം തുക:' : 'Total Amount:'}
                              </span>
                              <span className="flex items-center font-semibold text-green-600">
                                <IndianRupee className="h-4 w-4" />
                                {order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="border-t pt-3">
                              <p className="text-sm font-medium mb-2">
                                {currentLang ? 'ഇനങ്ങൾ:' : 'Items:'}
                              </p>
                              <div className="space-y-1">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{currentLang ? item.nameML : item.name} x {item.quantity}</span>
                                    <span className="flex items-center">
                                      <IndianRupee className="h-3 w-3" />
                                      {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="border-t pt-3">
                              <div className="flex justify-between text-sm">
                                <span>{currentLang ? 'പേയ്മെന്റ്:' : 'Payment:'}</span>
                                <span className="capitalize">
                                  {order.paymentMethod === 'cod' 
                                    ? (currentLang ? 'ക്യാഷ് ഓൺ ഡെലിവറി' : 'Cash on Delivery')
                                    : (currentLang ? 'ഓൺലൈൻ' : 'Online')
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span>{currentLang ? 'ഡെലിവറി വിലാസം:' : 'Delivery Address:'}</span>
                                <span className="text-right max-w-xs truncate">
                                  {order.shippingAddress.address}, {order.shippingAddress.city}
                                </span>
                              </div>
                            </div>
                            
                            {order.trackingNumber && (
                              <div className="border-t pt-3">
                                <div className="flex justify-between text-sm">
                                  <span>{currentLang ? 'ട്രാക്കിംഗ് നമ്പർ:' : 'Tracking Number:'}</span>
                                  <span className="font-mono">{order.trackingNumber}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}