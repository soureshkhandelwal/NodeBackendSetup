const express = require('express');
const app = express();
const PORT = 3010;

app.get('/constructor-fun', (req,res)=>{
    function BankAccount(name, balance=0){
        this.accHolder= name;
        this.balance= balance;
        this.accNumber= Date.now();
        
        // Methods
        this.deposit= function(amount){
            this.balance += amount
        }
        
         this.withdraaw= function(amount){
            this.balance -= amount
        }
    }
    
    const u1= new BankAccount('Souresh',1000);
    console.log(u1)

    res.send(u1)
})

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})