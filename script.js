// Mengatur event listener untuk dropdown jenis transaksi
document.getElementById('transactionType').addEventListener('change', function() {
    const type = this.value;
    const destinationAddressInput = document.getElementById('destinationAddress');
    if (type === 'shipping') {
        destinationAddressInput.style.display = 'block';
        destinationAddressInput.required = true;
    } else {
        destinationAddressInput.style.display = 'none';
        destinationAddressInput.required = false;
    }
});

// Menangani pengiriman form transaksi
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemQuantity = document.getElementById('itemQuantity').value;
    const transactionType = document.getElementById('transactionType').value;
    const destinationAddress = transactionType === 'shipping' ? document.getElementById('destinationAddress').value : '';
    const transactionDate = new Date().toISOString();

    const transaction = {
        name: itemName,
        quantity: itemQuantity,
        type: transactionType,
        address: destinationAddress,
        date: transactionDate
    };

    saveTransaction(transaction);
});

// Fungsi untuk menyimpan transaksi
function saveTransaction(transaction) {
    fetch('http://localhost:3000/transaksi', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log(data);
        displayTransactions();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Fungsi untuk menampilkan transaksi
function displayTransactions() {
    fetch('http://localhost:3000/transaksi')
        .then(response => response.json())
        .then(transactions => {
            const transactionList = document.getElementById('transactionList');
            transactionList.innerHTML = '';

            transactions.forEach((transaction) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.name}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.type}</td>
                    <td>${new Date(transaction.date).toLocaleString()}</td>
                    <td>${transaction.address || '-'}</td>
                `;
                transactionList.appendChild(row);
            });
        });
}

// Laporan Stok
document.getElementById('reportButton').addEventListener('click', function() {
    const date = document.getElementById('reportDate').value;
    fetch(`http://localhost:3000/laporan/${date}`)
        .then(response => response.json())
        .then(stock => {
            const stockList = document.getElementById('stockList');
            stockList.innerHTML = '';

            stock.forEach((item) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.stock}</td>
                `;
                stockList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Laporan Semua Transaksi
document.getElementById('transactionReportButton').addEventListener('click', function() {
    fetch('http://localhost:3000/transaksi')
        .then(response => response.json())
        .then(transactions => {
            const fullTransactionList = document.getElementById('fullTransactionList');
            fullTransactionList.innerHTML = '';

            transactions.forEach((transaction) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.name}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.type}</td>
                    <td>${new Date(transaction.date).toLocaleString()}</td>
                    <td>${transaction.address || '-'}</td>
                `;
                fullTransactionList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Tampilkan transaksi saat halaman dimuat
document.addEventListener('DOMContentLoaded', displayTransactions);

// Fungsi untuk mengunduh data sebagai file Excel
document.getElementById('downloadExcelButton').addEventListener('click', downloadDataAsExcel);

function downloadDataAsExcel() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const data = transactions.map(transaction => ({
        'Nama Barang': transaction.name,
        'Jumlah': transaction.quantity,
        'Jenis Transaksi': transaction.type,
        'Tanggal': new Date(transaction.date).toLocaleString(),
        'Alamat Tujuan': transaction.address || '-'
    }));

    // Buat worksheet dari data
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapan Transaksi');

    // Unduh file Excel
    XLSX.writeFile(workbook, 'rekapan_transaksi.xlsx');
}