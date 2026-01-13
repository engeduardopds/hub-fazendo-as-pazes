<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hub Fazendo as Pazes | Loja</title>
    <!-- Tailwind CSS (Link Limpo) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome (Link Limpo) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Inter', sans-serif; }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .view-section { display: none; }
        .view-section.active { display: block; animation: fadeIn 0.3s ease-out; }

        /* Toast Notification */
        #toast {
            visibility: hidden;
            min-width: 280px;
            background-color: rgba(13, 148, 136, 0.95);
            color: #fff;
            text-align: center;
            border-radius: 50px;
            padding: 12px 24px;
            position: fixed;
            z-index: 100;
            left: 50%;
            bottom: 30px;
            transform: translateX(-50%);
            font-size: 14px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.5s, bottom 0.5s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        #toast.show {
            visibility: visible;
            opacity: 1;
            bottom: 50px;
        }
        
        .payment-radio:checked + div {
            border-color: #0d9488;
            background-color: #f0fdfa;
            color: #0f766e;
            font-weight: 600;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 min-h-screen flex flex-col">

    <!-- Navbar -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="container mx-auto px-6 h-16 flex justify-between items-center">
            <div class="flex items-center gap-2 cursor-pointer" onclick="router('home')">
                <div class="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">FP</div>
                <span class="font-bold text-lg tracking-tight">Hub Fazendo as Pazes</span>
            </div>
            <div class="relative cursor-pointer hover:text-teal-600 transition" onclick="router('cart')">
                <i class="fa-solid fa-cart-shopping text-xl"></i>
                <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
            </div>
        </div>
    </header>

    <main class="flex-grow container mx-auto px-6 py-8">
        
        <!-- VIEW 1: HOME -->
        <div id="view-home" class="view-section active">
            <div class="text-center mb-12">
                <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Loja Oficial</h1>
                <p class="text-gray-600">Cursos, materiais e ferramentas para sua jornada.</p>
            </div>
            <div id="catalog-container" class="space-y-16"></div>
        </div>

        <!-- VIEW 2: PRODUCT -->
        <div id="view-product" class="view-section">
            <button onclick="router('home')" class="mb-6 text-sm text-gray-500 hover:text-teal-600 flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> Voltar para a loja
            </button>
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="grid grid-cols-1 md:grid-cols-2">
                    <div class="bg-gray-100 h-64 md:h-auto flex items-center justify-center p-8">
                        <span id="detail-icon" class="text-9xl text-gray-300">📦</span>
                    </div>
                    <div class="p-8 md:p-12 flex flex-col justify-center">
                        <span id="detail-category" class="text-teal-600 font-bold text-sm uppercase tracking-wide mb-2">Categoria</span>
                        <h2 id="detail-title" class="text-3xl font-bold text-gray-900 mb-4">Nome do Item</h2>
                        <p id="detail-desc" class="text-gray-600 mb-6 leading-relaxed">Descrição.</p>
                        <div class="text-2xl font-bold text-gray-900 mb-8" id="detail-price">R$ 0,00</div>
                        <div class="flex items-center gap-4 mb-6">
                            <div class="flex items-center border border-gray-300 rounded-lg">
                                <button onclick="updateQty(-1)" class="px-4 py-2 hover:bg-gray-100 text-gray-600">-</button>
                                <span id="detail-qty" class="px-4 font-bold">1</span>
                                <button onclick="updateQty(1)" class="px-4 py-2 hover:bg-gray-100 text-gray-600">+</button>
                            </div>
                            <span class="text-sm text-gray-500">Unidades</span>
                        </div>
                        <button onclick="addToCartCurrent()" class="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
                            <i class="fa-solid fa-cart-plus"></i> Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- VIEW 3: CART / CHECKOUT -->
        <div id="view-cart" class="view-section">
            <button onclick="router('home')" class="mb-6 text-sm text-gray-500 hover:text-teal-600 flex items-center gap-2">
                <i class="fa-solid fa-arrow-left"></i> Continuar comprando
            </button>
            <h2 class="text-2xl font-bold mb-6">Seu Carrinho</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Itens -->
                <div class="lg:col-span-2 space-y-4" id="cart-items-container">
                    <div class="text-center py-10 bg-white rounded-lg border border-gray-200"><p class="text-gray-500">Seu carrinho está vazio.</p></div>
                </div>

                <!-- Resumo e Pagamento -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 class="font-bold text-lg mb-4">Pagamento</h3>
                    
                    <div class="space-y-3 mb-6">
                        <p class="text-sm text-gray-500 font-semibold mb-2">Forma de pagamento:</p>
                        
                        <!-- PIX / DÉBITO -->
                        <label class="cursor-pointer block">
                            <input type="radio" name="payment_method" value="PIX" class="hidden payment-radio" onchange="updatePaymentUI()" checked>
                            <div class="border border-gray-300 rounded-lg p-3 flex items-center gap-3 hover:border-teal-500 transition">
                                <i class="fa-brands fa-pix text-teal-600 text-xl"></i>
                                <span class="font-medium">Pix (À vista)</span>
                            </div>
                        </label>
                        <!-- Nota: Removida a opção separada de débito, pois geralmente entra como crédito à vista ou a API de links trata diferente. Se quiser estritamente débito, o Asaas link costuma agrupar. -->

                        <!-- CRÉDITO -->
                        <label class="cursor-pointer block">
                            <input type="radio" name="payment_method" value="CREDIT_CARD" class="hidden payment-radio" onchange="updatePaymentUI()">
                            <div class="border border-gray-300 rounded-lg p-3 flex flex-col hover:border-teal-500 transition">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-credit-card text-orange-600 text-xl"></i>
                                    <span class="font-medium">Crédito (à vista ou parcelado)</span>
                                </div>
                                <!-- Dropdown de Parcelas -->
                                <div id="installments-wrapper" class="hidden mt-3 pt-3 border-t border-gray-200">
                                    <label class="text-xs text-gray-500 block mb-1">Parcelamento:</label>
                                    <select id="installments" class="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-teal-500" onchange="calculateTotal()">
                                        <!-- Opções injetadas via JS -->
                                    </select>
                                </div>
                            </div>
                        </label>
                    </div>

                    <!-- Totais -->
                    <div class="border-t pt-4">
                        <div class="flex justify-between mb-2 text-gray-600">
                            <span>Subtotal</span>
                            <span id="cart-subtotal">R$ 0,00</span>
                        </div>
                        <div class="flex justify-between mb-6 text-xl font-bold text-gray-900 border-t pt-4">
                            <span>Total</span>
                            <span id="cart-total">R$ 0,00</span>
                        </div>
                    </div>
                    
                    <button id="btn-checkout" onclick="checkout()" class="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-md mb-3 flex justify-center items-center gap-2">
                        <span>Ir para Pagamento</span> <i class="fa-solid fa-lock"></i>
                    </button>
                    <p class="text-xs text-center text-gray-400">Ambiente seguro via Asaas</p>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-white border-t border-gray-200 py-8 mt-auto">
        <div class="container mx-auto px-6 text-center text-sm text-gray-500">&copy; 2025 Hub Fazendo as Pazes. Todos os direitos reservados.</div>
    </footer>

    <div id="toast">Item adicionado ao carrinho!</div>

    <script>
        // --- DADOS E TAXAS ---
        const db = [
            { title: "Seção 1: Cursos Online", items: [{ id: 101, name: "Item 1 (Curso TDAH)", price: 197.00, icon: "🎓", desc: "Descrição." }, { id: 102, name: "Item 2 (Curso Ansiedade)", price: 147.00, icon: "🧘‍♀️", desc: "Curso..." }] },
            { title: "Seção 2: E-books", items: [{ id: 201, name: "Item 1 (E-book Rotina)", price: 29.90, icon: "📚", desc: "Guia..." }, { id: 202, name: "Item 2 (Kit Planilhas)", price: 19.90, icon: "📊", desc: "Planilhas..." }] },
            { title: "Seção 3: Impressões 3D", items: [{ id: 301, name: "Item 1 (Fidget Toy)", price: 45.00, icon: "🎲", desc: "Brinquedo..." }, { id: 302, name: "Item 2 (Organizador)", price: 60.00, icon: "🗂️", desc: "Organizador..." }] }
        ];

        const fees = {
            PIX: 0, 
            CREDIT_CARD: { 1: 0.00, 2: 0.04, 3: 0.05, 4: 0.06, 5: 0.07, 6: 0.08 }
        };

        let cart = [];
        let currentItem = null;
        let currentQty = 1;

        function init() { renderCatalog(); updateCartIcon(); }

        function router(viewName) {
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.getElementById(`view-${viewName}`).classList.add('active');
            window.scrollTo(0, 0);
            if (viewName === 'cart') { renderCart(); setTimeout(updatePaymentUI, 100); }
        }

        function renderCatalog() {
            const container = document.getElementById('catalog-container');
            container.innerHTML = '';
            db.forEach(section => {
                let itemsHtml = '';
                section.items.forEach(item => {
                    itemsHtml += `<div onclick="openProduct(${item.id})" class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer p-4 group"><div class="h-40 bg-teal-50 rounded-lg flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition duration-300">${item.icon}</div><h3 class="font-bold text-gray-900 text-lg mb-1">${item.name}</h3><p class="text-teal-600 font-semibold">R$ ${item.price.toFixed(2).replace('.', ',')}</p></div>`;
                });
                container.innerHTML += `<div><h2 class="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-teal-500 pl-4">${section.title}</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">${itemsHtml}</div></div>`;
            });
        }

        function openProduct(id) {
            let product = null, category = "";
            db.forEach(section => { const found = section.items.find(i => i.id === id); if (found) { product = found; category = section.title; } });
            if (!product) return;
            currentItem = product; currentQty = 1;
            document.getElementById('detail-icon').textContent = product.icon;
            document.getElementById('detail-category').textContent = category;
            document.getElementById('detail-title').textContent = product.name;
            document.getElementById('detail-desc').textContent = product.desc;
            document.getElementById('detail-price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
            document.getElementById('detail-qty').textContent = currentQty;
            router('product');
        }

        function updateQty(amount) { if (currentQty + amount >= 1) { currentQty += amount; document.getElementById('detail-qty').textContent = currentQty; } }
        function showToast(message) { const t = document.getElementById("toast"); t.innerHTML = `<i class="fa-solid fa-check-circle mr-2"></i> ${message}`; t.className = "show"; setTimeout(() => t.className = "", 3000); }
        
        function addToCartCurrent() {
            const existing = cart.find(i => i.id === currentItem.id);
            if (existing) existing.qty += currentQty; else cart.push({ ...currentItem, qty: currentQty });
            updateCartIcon(); showToast(`${currentQty}x ${currentItem.name} adicionado!`);
        }
        function updateCartIcon() { document.getElementById('cart-count').textContent = cart.reduce((acc, item) => acc + item.qty, 0); }
        function removeFromCart(index) { cart.splice(index, 1); renderCart(); updateCartIcon(); }

        function renderCart() {
            const container = document.getElementById('cart-items-container');
            container.innerHTML = '';
            if (cart.length === 0) { container.innerHTML = '<div class="text-center py-10 bg-white rounded-lg border border-gray-200"><p class="text-gray-500">Seu carrinho está vazio.</p></div>'; }
            else {
                cart.forEach((item, index) => {
                    container.innerHTML += `<div class="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">${item.icon}</div><div><h4 class="font-bold text-gray-900">${item.name}</h4><p class="text-sm text-gray-500">R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.qty}</p></div></div><div class="flex items-center gap-4"><span class="font-bold text-teal-700">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span><button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button></div></div>`;
                });
            }
        }

        // --- LÓGICA DE PAGAMENTO E UI ---
        function updatePaymentUI() {
            const method = document.querySelector('input[name="payment_method"]:checked').value;
            const wrap = document.getElementById('installments-wrapper');
            const select = document.getElementById('installments');
            
            if (method === 'CREDIT_CARD') {
                wrap.classList.remove('hidden');
                const baseTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
                select.innerHTML = '';
                for (let i = 1; i <= 6; i++) {
                    const rate = fees.CREDIT_CARD[i] || 0;
                    const total = baseTotal * (1 + rate);
                    const parc = total / i;
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.text = `${i}x de R$ ${parc.toFixed(2).replace('.', ',')} (Total: R$ ${total.toFixed(2).replace('.', ',')})`;
                    select.appendChild(opt);
                }
            } else {
                wrap.classList.add('hidden');
            }
            calculateTotal();
        }

        function calculateTotal() {
            if (cart.length === 0) return { finalTotal: 0, method: 'NONE', installments: 1 };
            const baseTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
            const method = document.querySelector('input[name="payment_method"]:checked').value;
            let finalTotal = baseTotal;
            let installments = 1;

            if (method === 'CREDIT_CARD') {
                installments = parseInt(document.getElementById('installments').value) || 1;
                const rate = fees.CREDIT_CARD[installments] || 0;
                finalTotal = baseTotal * (1 + rate);
            } else {
                finalTotal = baseTotal; // Pix sem juros extra
            }

            document.getElementById('cart-total').textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
            return { finalTotal, method, installments };
        }

        async function checkout() {
            if (cart.length === 0) { showToast("Carrinho vazio!"); return; }

            const btn = document.getElementById('btn-checkout');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processando...`;
            btn.disabled = true;

            const { finalTotal, method, installments } = calculateTotal();
            const description = cart.map(i => `${i.qty}x ${i.name}`).join(', ') + ` (${method})`;

            try {
                // Envia para a API com os dados corretos
                const response = await fetch('/.netlify/functions/create_payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        value: finalTotal.toFixed(2), 
                        description: `Pedido Hub: ${description}`,
                        billingType: method, 
                        installmentCount: installments
                    })
                });

                const data = await response.json();

                if (response.ok && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    throw new Error(data.error || 'Erro ao criar pagamento');
                }
            } catch (error) {
                console.error("Erro checkout:", error);
                alert("Erro ao conectar: " + error.message);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        init();
    </script>
</body>
</html>
```
```eof
