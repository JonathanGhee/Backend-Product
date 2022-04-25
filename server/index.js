const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json())
app.listen(5000,()=>{
    console.log('listening to port 5000 for server')
})

const credentials = {
    user:'jonathanghee',
    host: 'localhost',
    database:'sdc',
    password:'password',
    port:5432
}

const pool =new Pool(credentials);


app.get('/products', async (req, res) => {
    try {
        const page = req.query.page || 1
        const count = req.query.count || 5
        const offset = (page-1)*count
        const product = await pool.query(
            'SELECT product.id, name, slogan, description, category, default_price FROM product order by id asc LIMIT ($1) OFFSET ($2)',
            [count,offset])
        res.json(product.rows)
        console.log(product.rows)
    } catch (err) {
       console.error(err.message)
    }
})
app.get('/products/:product_id', async (req, res) => {
    try {
        const product = await pool.query(
            'SELECT id,name,slogan,description,category,default_price, (SELECT json_agg(features) from (SELECT feature,value FROM features WHERE product_id=($1)) as features) as features FROM product WHERE id=($1)',
            [req.params.product_id])
        res.json(product.rows)
        console.log(product.rows)
    } catch (err) {
       console.error(err.message)
    }
})
app.get('/products/:product_id/styles', async (req, res) => {
    try {
        const product = await pool.query(`SELECT DISTINCT ON (prod_id) prod_id,(SELECT json_agg(styles) 
        FROM (SELECT style_id, name, sale_price, original_price, "default?", (SELECT json_agg(photos) 
        FROM (SELECT thumbnail_url,url from photos where style_id=styles.style_id) as photos) as photos,(SELECT json_object_agg(id,json_build_object('quantity',skus.quantity,'size', skus.size)) 
        FROM skus WHERE style_id=6) as skus FROM styles WHERE prod_id=($1))as styles) as results FROM styles WHERE prod_id=($1)`,
       [req.params.product_id])
        res.json(product.rows)
        console.log(product.rows)
    } catch (err) {
       console.error(err.message)
    }
})
app.get('/products/:product_id/related', async (req, res) => {
    try {
        const product = await pool.query(
            `SELECT array_agg(related) FROM related WHERE current=($1)`,
            [req.params.product_id])
        res.json(product.rows[0].array_agg)
        console.log(product.rows[0].array_agg)
    } catch (err) {
       console.error(err.message)
    }
})

 


