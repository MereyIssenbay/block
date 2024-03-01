export default{
    name: 'focus',
    mounted(elem, binding){
        console.log(elem, binding)
        elem.focus()
    }
}