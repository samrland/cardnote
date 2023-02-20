let files = []

let fileList = []

if (localStorage.getItem('fileList') === null) {
    let exampleFileList = JSON.stringify(['example'])
    localStorage.setItem('fileList', exampleFileList)
    localStorage.setItem('example', 'Welcome to CardNote. This is an example file! Use the options in the bottom-left hand corner to create a note.')
}

window.onload = () => {
    loadFileList()
    loadFiles()
    showSplashScreen()
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function makeid(length) {
    let result           = ''
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length

    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
}

function loadFileList() {
    fileList = JSON.parse(localStorage.getItem('fileList'))

    for (let item of fileList) {
        let localString = localStorage.getItem(item)
        let objectified = { name: item, content: localString }
        files.push(objectified)
    }
}

function loadFiles() {
    let scroll = document.querySelector('#files').scrollTop
    clearFiles()

    for (let item of files) {
        let fileDiv = document.createElement('div')

        fileDiv.addEventListener('click', () => {
            loadFile(item)
        })

        fileDiv.addEventListener('contextmenu', e => {
            e.preventDefault()
            createContextMenu(e.pageX, e.pageY, item)
        })

        fileDiv.className = 'file'
    	fileDiv.title = item.name
        fileDiv.id = 'file_' + item.name

        let a = document.createElement('a')
        a.className = 'asdf-container'
        fileDiv.appendChild(a)

        let textnode = document.createTextNode(item.name)
        a.appendChild(textnode)

        let deleteBtn = document.createElement('button')
        deleteBtn.className = 'btn'
        deleteBtn.innerHTML = `<i class='material-icons fix-button'>delete</i>`
        deleteBtn.title = 'Delete this note'
        deleteBtn.addEventListener('click', e => {
            if (e.shiftKey) {
                removeFile(item.name, true)
            } else {
                askRemoveFile(item.name)
            }
        })
        fileDiv.appendChild(deleteBtn)

        let editBtn = document.createElement('button')
        editBtn.className = 'btn'
        editBtn.innerHTML = `<i class='material-icons fix-button'>edit</i>`
        editBtn.title = 'Rename note'
        editBtn.addEventListener('click', () => {
            askRenameFile(item.name)
        })
        fileDiv.appendChild(editBtn)

        document.querySelector('#files').appendChild(fileDiv)
    }

    createTools()
    document.querySelector('#files').scrollTop = scroll
}

function loadFile(item) {
    loadFiles()

    let splashtext = document.querySelector('#splashtext')
    splashtext.classList.add('hidden')

    let fileContent = document.querySelector('#contents')
    let fileName = document.querySelector('#title')
    fileContent.classList.remove('hidden')
    fileName.innerText = item.name

    fileContent.value = localStorage.getItem(item.name)

    let selectionDiv = document.querySelector('#file_' + item.name)
    if (selectionDiv == null) {
       showSplashScreen()
    } else {
        document.querySelector('#file_' + item.name).classList.add('selected')
    }

    autoExpand(fileContent)
}

function save() {
    let fileContent = document.querySelector('#contents')
    let fileName    = document.querySelector('#title')

    localStorage.setItem(fileName.innerText, fileContent.value)
}

function createFile(fileName, fileContent) {
    if (fileName == 'fileList' || fileName == '' || fileList.includes(fileName) || fileName == 'notedllama' || fileName.split(' ').length > 1) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'File name error (You should never see this screen)',
            footer: `<a class='llama' href='https://i.etsystatic.com/14058045/r/il/d17ec2/1488837902/il_570xN.1488837902_c9os.jpg' target='_blank'>picture of llama to cheer you up</a>`
        })
    } else {
        let newFileName = fileName
        localStorage.setItem(newFileName, fileContent)
        let oldFileList = JSON.parse(localStorage.getItem('fileList'))
        let joined = [newFileName, ...oldFileList]

        localStorage.setItem('fileList', JSON.stringify(joined))
        files.push({ name: newFileName, content: fileContent })
        fileList.push(newFileName)
    
        loadFiles()
        loadFile({ name: newFileName, content: fileContent })
    }
}

function clearFiles() {
   document.querySelector('#sidebar').innerHTML = `<div onclick='showSplashScreen()' class='noselect'><h1 class='logo'><i class='material-icons'>description</i> CardNote</h1></div><hr class='top-hr'>`

    let fileContainer       = document.createElement('div')
    fileContainer.id        = 'files'
    fileContainer.className = 'files'

    document.querySelector('#sidebar').appendChild(fileContainer)
}

function createTools() {
    let toolbox = document.createElement('div')
    toolbox.className = 'toolbox'

    let createButton       = document.createElement('button')
    createButton.innerHTML = `<i class='material-icons'>add</i>`
    createButton.title     = 'Create new note'
    createButton.className = 'toolboxbutton addbutton'
    createButton.addEventListener('click', () => {
        askFileName()
    })

    let clearButton       = document.createElement('button')
    clearButton.innerHTML = `<i class='material-icons'>delete_sweep</i>`
    clearButton.title     = 'Delete all notes'
    clearButton.className = 'toolboxbutton delete-allbutton'
    clearButton.addEventListener('click', () => {
        clearAll()
    })

    let uploadButton       = document.createElement('button')
    uploadButton.innerHTML = `<i class='material-icons'>publish</i>`
    uploadButton.title     = 'Upload note from computer'
    uploadButton.className = 'toolboxbutton uploadbutton'
    uploadButton.addEventListener('click', () => {
        uploadFile()
    })

    toolbox.appendChild(createButton)
    toolbox.appendChild(uploadButton)
    toolbox.appendChild(clearButton)

    document.querySelector('#sidebar').appendChild(toolbox)
}

async function askFileName() {
    Swal.fire({
        title: 'File name',
        text: 'What do you want to name this awesome note?',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to name it something!'
            }
            if (value == 'fileList') {
                return 'Sorry, that name is reserved.'
            }
            if (fileList.includes(value)) {
                return 'Sorry, that name is taken. (Déjà vu?)'
            }
            if (value.split(' ').length > 1) {
                return 'Sorry, but spaces currently do not work in file names.'
            }
        }
    }).then((result) => {
        if (result.value) {
            createFile(result.value, 'Start typing...')
        }
    })
}

async function askRemoveFile(name) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, delete ${escapeHtml(name)}!`
    }).then((result) => {
        if (result.value) {
            removeFile(name, true)     
        }
    })
}

function removeFile(name, showToast) {
    localStorage.removeItem(name)
    let whats = JSON.parse(localStorage.getItem('fileList'))
    let index = whats.indexOf(name)
    whats.splice(index, 1)
    localStorage.setItem('fileList', JSON.stringify(whats))

    let index2 = fileList.indexOf(name)
    fileList.splice(index2, 1)

    let removeIndex = files.map((item) => { return item.name })
                        .indexOf(name)

    ~removeIndex && files.splice(removeIndex, 1)
    
    loadFiles()
    showSplashScreen()

    if (showToast) {
        swal.fire({
            title: `${escapeHtml(name)} was deleted`,
            showCancelButton: false,
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: 'top-right',
            icon: 'success',
        })
    }
}

function showSplashScreen() {
    loadFiles()

    document.querySelector('#title').innerText = 'CardNote'
    document.querySelector('#contents').classList.add('hidden')

    document.querySelector('#splashtext').classList.remove('hidden')
    document.querySelector('#splashtext').innerHTML = 'Select a document or create one with the panel on the left.'
}

function renameFile(oldName, newName) {
    let oldcontent = localStorage.getItem(oldName)
    let oldList = JSON.parse(localStorage.getItem('fileList'))
    
    localStorage.setItem(newName, oldcontent)
    files.push({ name: newName, content: oldcontent })

    oldList.push(newName)
    localStorage.setItem('fileList', JSON.stringify(oldList))

    removeFile(oldName, false)
    loadFiles()
    fileList.push(newName)
    loadFile({ name: newName, content: oldcontent })

    swal.fire({
        title: `${escapeHtml(oldName)} was renamed to ${escapeHtml(newName)}`,
        showCancelButton: false,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: 'top-right',
        icon: 'success',
    })
}

async function askRenameFile(oldName) {
    Swal.fire({
        title: 'New file name',
        text: 'What do you want to rename this awesome note to?',
        input: 'text',
        inputValue: oldName,
        showCancelButton: true,
        inputValidator: (value) => {
            if (value == oldName) {
                return 'You have to actually... you know... change the name?'
            }
            if (!value) {
              return 'You need to name it something!'
            }
            if (value == 'fileList') {
                return 'Sorry, that name is reserved.'
            }
            if (fileList.includes(value)) {
                return 'Sorry, that name is taken. (Déjà vu?)'
            }
          }     
    }).then((result) => {
        if (result.value) {
            renameFile(oldName, result.value)
        }
    })
}

function autoExpand(field) {
	// Reset field height
	field.style.height = 'inherit'

	// Get the computed styles for the element
	let computed = window.getComputedStyle(field)

	// Calculate the height
	let height = parseInt(computed.getPropertyValue('border-top-width'), 10)
	             + parseInt(computed.getPropertyValue('padding-top'), 10)
	             + field.scrollHeight
	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10)

	field.style.height = height + 'px'
}

document.addEventListener('input', (event) => {
	if (event.target.tagName.toLowerCase() !== 'textarea') return
	autoExpand(event.target)
}, false)

async function clearAll() {
    Swal.fire({
        title: 'Are you sure?',
        text: `You won't be able to revert this!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete everything!'
    }).then((result) => {
        if (result.value) {
            let fileListClear = JSON.parse(localStorage.getItem('fileList'))

            for (let file of fileListClear) {
                removeFile(file, false)
            }

            loadFiles()
            showSplashScreen()

            swal.fire({
                title: 'Notes cleared',
                showCancelButton: false,
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-right',
                icon: 'success'
            })
        }
    })
}

function saveTextAsFile(textToWrite, fileNameToSaveAs) {
    let textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' })

    let downloadLink       = document.createElement('a')
    downloadLink.download  = fileNameToSaveAs
    downloadLink.innerHTML = 'Download File'

    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob)
    } else {
        // Firefox requires the link to be added to the DOM before it can be clicked.
        downloadLink.href          = window.URL.createObjectURL(textFileAsBlob)
        downloadLink.onclick       = destroyClickedElement
        downloadLink.style.display = 'none'

        document.body.appendChild(downloadLink)
    }

    downloadLink.click()
}

async function uploadFile() {
    const { value: file } = await Swal.fire({
        title: 'Select text file',
        input: 'file',
        inputAttributes: {
          'accept': 'text/*',
          'aria-label': 'Upload a text file',
          'id': 'fileUploader'
        }
    })
      
    if (file) {
        const reader = new FileReader()
    
        reader.onload = () => {
            let randomString = makeid(10)

            if (fileList.includes(file.name)) {
                createFile(`${file.name} - ${randomString}`, reader.result)
            } else {
                createFile(file.name, reader.result)
            }
        }
        
        reader.readAsText(file)
    }
}

function createContextMenu(x, y, file) {
    let oldElement = document.querySelector('#context-menu')
    let newElement = oldElement.cloneNode(true)
    oldElement.parentNode.replaceChild(newElement, oldElement)

    let contextDiv = document.querySelector('#context-menu')
    contextDiv.style.top     = y + 'px'
    contextDiv.style.left    = x + 'px'
    contextDiv.style.display = 'block'

    let menuTitle = document.querySelector('#menu-title')

    let renameBtn   = document.querySelector('#renameBtn')
    let deleteBtn   = document.querySelector('#deleteBtn')
    let downloadBtn = document.querySelector('#downloadBtn')

    menuTitle.innerText = file.name

    renameBtn.addEventListener('click', () => {
        askRenameFile(file.name)
    })

    deleteBtn.addEventListener('click', e => {
        if (e.shiftKey) {
            removeFile(file.name, true)
        } else {
            askRemoveFile(file.name)
        }
    })

    downloadBtn.addEventListener('click', () => {
        let itemContent = localStorage.getItem(file.name)
        saveTextAsFile(itemContent, file.name)
    })

    window.addEventListener('click', () => {
       document.querySelector('#context-menu').style.display = 'none'
    })
}

function wordWrap() {

}

window.addEventListener('click', () => {
    document.querySelector('#context-menu').style.display = 'none'
})

// document.querySelector('#wordwrap-button').addEventListener('click', () => {
//     if (document.querySelector('#contents').hasClass('wrap-text')) {
//         document.querySelector('#contents').removeClass('wrap-text')
//         localStorage.setItem('wrap-text', false)
//     } else {
//         document.querySelector('#contents').addClass('wrap-text')
//         localStorage.setItem('wrap-text', true)
//     }
// })
