require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Person = require('./models/person')


const morgan = require('morgan')


app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))


let persons = []

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({error: error.message})
  }

  next(error)
}

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
    Person.find({}).then( person => {
        response.json(person)
    })
})

app.get('/api/persons/:id', (request, response, next ) => {
    const id = Number(request.params.id)

    Person.findById(request.params.id)
    .then(person => {
        if( person ){
            response.json(person)
        } else {
            response.status(404).end()
        }
      })
    .catch( error => next(error))
    

    /*const person = persons.find( person => person.id === id )

    if (person){
        response.json(person)
    } else {
        response.status(404).end()
    }*/
})


const generateId = () => {
    return Math.floor(Math.random(99999) *100000)
}

const checkName = (name) => {
    return persons.filter( person => person.name === name )
}

app.post('/api/persons', (request, response, next) => {
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

    const person = new Person( {
        name: body.name,
        number: body.number || false
    })

    person.save()
    .then( savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {

    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
    
    /*
    persons = persons.filter( person => person.id !== id) 
    response.status(204).end()*/
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const { name, number } = request.body
    
    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(
        request.params.id, {name, number}, { new: true, runValidators: true, context: 'query' })
        .then(updatePerson => {
            response.json(updatePerson)
        })
        .catch( error => next(error))
})


app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })