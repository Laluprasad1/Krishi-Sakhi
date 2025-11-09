import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  LogOut,
  IndianRupee,
  Star,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import { useMarketplace, Product, Order } from '@/contexts/MarketplaceContext';

interface AdminDashboardProps {
  onLogout: () => void;
  currentLang: boolean;
}

export default function AdminDashboard({ onLogout, currentLang }: AdminDashboardProps) {
  const {
    products,
    categories,
    getAllOrders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    nameML: '',
    description: '',
    descriptionML: '',
    price: 0,
    originalPrice: 0,
    category: 'seeds' as Product['category'],
    image: '/api/placeholder/300/200',
    stockQuantity: 0,
    unit: 'kg',
    seller: 'Krishi Sakhi Store',
    rating: 5,
    reviews: 0,
    isOrganic: false
  });

  const orders = getAllOrders();
  
  // Statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => order.orderStatus === 'pending').length;

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      addProduct({
        ...newProduct,
        inStock: newProduct.stockQuantity > 0
      });
      setNewProduct({
        name: '',
        nameML: '',
        description: '',
        descriptionML: '',
        price: 0,
        originalPrice: 0,
        category: 'seeds',
        image: '/api/placeholder/300/200',
        stockQuantity: 0,
        unit: 'kg',
        seller: 'Krishi Sakhi Store',
        rating: 5,
        reviews: 0,
        isOrganic: false
      });
      setShowAddProduct(false);
    }
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm(currentLang ? 'ഈ ഉത്പന്നം ഇല്ലാതാക്കണോ?' : 'Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const getStatusColor = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentLang ? 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്' : 'Admin Dashboard'}
                </h1>
                <p className="text-gray-600">
                  {currentLang ? 'കൃഷി സഖി മാർക്കറ്റ്‌പ്ലേസ് മാനേജ്‌മെന്റ്' : 'Krishi Sakhi Marketplace Management'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {currentLang ? 'ലോഗൗട്ട്' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentLang ? 'മൊത്തം ഉത്പന്നങ്ങൾ' : 'Total Products'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentLang ? 'മൊത്തം ഓർഡറുകൾ' : 'Total Orders'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentLang ? 'മൊത്തം റവന്യൂ' : 'Total Revenue'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {totalRevenue.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {currentLang ? 'പെൻഡിംഗ് ഓർഡറുകൾ' : 'Pending Orders'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {currentLang ? 'ഓവർവ്യൂ' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="products">
              {currentLang ? 'ഉത്പന്നങ്ങൾ' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="orders">
              {currentLang ? 'ഓർഡറുകൾ' : 'Orders'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{currentLang ? 'സമീപകാല ഓർഡറുകൾ' : 'Recent Orders'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {order.totalAmount}
                          </p>
                          <Badge className={getStatusColor(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{currentLang ? 'ടോപ്പ് ഉത്പന്നങ്ങൾ' : 'Top Products'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{currentLang ? product.nameML : product.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                              <span className="text-xs text-gray-600">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {product.price}
                          </p>
                          <p className="text-xs text-gray-600">{product.stockQuantity} {product.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{currentLang ? 'ഉത്പന്ന മാനേജ്‌മെന്റ്' : 'Product Management'}</CardTitle>
                    <CardDescription>
                      {currentLang ? 'ഉത്പന്നങ്ങൾ ചേർക്കുക, എഡിറ്റ് ചെയ്യുക, ഇല്ലാതാക്കുക' : 'Add, edit, and manage products'}
                    </CardDescription>
                  </div>
                  <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {currentLang ? 'ഉത്പന്നം ചേർക്കുക' : 'Add Product'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{currentLang ? 'പുതിയ ഉത്പന്നം ചേർക്കുക' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                          {currentLang ? 'മാർക്കറ്റ്‌പ്ലേസിൽ വിൽക്കാനായി പുതിയ ഉത്പന്നം ചേർക്കുക' : 'Add a new product to the marketplace'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{currentLang ? 'ഉത്പന്നത്തിന്റെ പേര് (ഇംഗ്ലീഷ്)' : 'Product Name (English)'}</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            placeholder="Enter product name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{currentLang ? 'ഉത്പന്നത്തിന്റെ പേര് (മലയാളം)' : 'Product Name (Malayalam)'}</Label>
                          <Input
                            value={newProduct.nameML}
                            onChange={(e) => setNewProduct({...newProduct, nameML: e.target.value})}
                            placeholder="ഉത്പന്നത്തിന്റെ പേര്"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{currentLang ? 'വില' : 'Price'}</Label>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                            placeholder="Enter price"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{currentLang ? 'കാറ്റഗറി' : 'Category'}</Label>
                          <Select onValueChange={(value: Product['category']) => setNewProduct({...newProduct, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {currentLang ? category.nameML : category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{currentLang ? 'സ്റ്റോക്ക് അളവ്' : 'Stock Quantity'}</Label>
                          <Input
                            type="number"
                            value={newProduct.stockQuantity}
                            onChange={(e) => setNewProduct({...newProduct, stockQuantity: Number(e.target.value)})}
                            placeholder="Enter stock quantity"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{currentLang ? 'യൂണിറ്റ്' : 'Unit'}</Label>
                          <Select onValueChange={(value) => setNewProduct({...newProduct, unit: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">Kg</SelectItem>
                              <SelectItem value="liter">Liter</SelectItem>
                              <SelectItem value="piece">Piece</SelectItem>
                              <SelectItem value="gram">Gram</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>{currentLang ? 'വിവരണം (ഇംഗ്ലീഷ്)' : 'Description (English)'}</Label>
                          <Textarea
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            placeholder="Enter product description"
                            rows={3}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label>{currentLang ? 'വിവരണം (മലയാളം)' : 'Description (Malayalam)'}</Label>
                          <Textarea
                            value={newProduct.descriptionML}
                            onChange={(e) => setNewProduct({...newProduct, descriptionML: e.target.value})}
                            placeholder="ഉത്പന്നത്തിന്റെ വിവരണം"
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowAddProduct(false)} className="flex-1">
                          {currentLang ? 'റദ്ദാക്കുക' : 'Cancel'}
                        </Button>
                        <Button onClick={handleAddProduct} className="flex-1">
                          {currentLang ? 'ഉത്പന്നം ചേർക്കുക' : 'Add Product'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-medium">{currentLang ? product.nameML : product.name}</h3>
                          <p className="text-sm text-gray-600">{currentLang ? product.categoryML : product.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={product.inStock ? "default" : "secondary"}>
                              {product.inStock ? (currentLang ? 'സ്റ്റോക്കിൽ' : 'In Stock') : (currentLang ? 'സ്റ്റോക്കില്ല' : 'Out of Stock')}
                            </Badge>
                            <span className="text-sm text-gray-500">{product.stockQuantity} {product.unit}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {product.price}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                            <span className="text-xs text-gray-600">{product.rating} ({product.reviews})</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{currentLang ? 'ഓർഡർ മാനേജ്‌മെന്റ്' : 'Order Management'}</CardTitle>
                <CardDescription>
                  {currentLang ? 'ഓർഡറുകൾ ട്രാക്ക് ചെയ്യുക, സ്റ്റാറ്റസ് അപ്‌ഡേറ്റ് ചെയ്യുക' : 'Track orders and update status'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">#{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customerName} ({order.customerEmail})</p>
                          <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {order.totalAmount}
                          </p>
                          <Select 
                            value={order.orderStatus} 
                            onValueChange={(value: Order['orderStatus']) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{currentLang ? item.nameML : item.name} x{item.quantity}</span>
                            <span className="flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}