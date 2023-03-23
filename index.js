const express = require('express')
const cors = require('cors')

const morgan = require('morgan')

const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]



morgan.token( 'person', function(req, res){
    return JSON.stringify(req.body)
})

app.get( '/', (request, response ) => {
    response.send('<h1>Phonebook APP</h1>')
   
})

app.get('/info', (request, response) => {
    const date = new Date()

    response.send(`Phonebook has info for ${persons.length} people
     <br /> ${date}`)
})

app.get('/api/persons/', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find( person => person.id === id )

    if (person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

const generateId = () => {
    return Math.floor(Math.random(99999) *100000)
}

const checkName = (name) => {
    return persons.filter( person => person.name === name )
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number ){
        return response.status(404).json({
            error: 'content missing'
        })
    }

    if(checkName(body.name).length > 0){
        return response.status(409).json({
            error: 'content already in db'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number || false
    }

    persons = persons.concat(person)

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    
    persons = persons.filter( person => person.id !== id) 
    response.status(204).end()
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })