
function validator(options){
    
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selecterRules = {};
    //Hàm thực hiện validate
    var validate = function(inputElement,rule){
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage ;

        //Lấy các rules của selector
        var rules = selecterRules[rule.selector];

        //Lọc qua từng rule và kiểm tra
        //Nếu có lỗi thì dừng kiểm trả
        for(var i = 0; i<rules.length; ++i){
            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)

            }
            if(errorMessage) break ;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')
        }else{
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage;
    };

    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form);


    if(formElement){
        //Khi submit form 
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;

            //Lọc qua từng rule và validate 
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement,rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){

                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){ 
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name ="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = '';
                                    return values; 
                                } 
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                // if (input.matches(':checked')) {
                                //     values[input.name].push(input.value);
                                // }
                                 values[input.name].push(input.name);
                                break;
                           
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return  values;
                    },{})
                    options.onSubmit(formValues)
                }
            }

        }

        //Lặp qua mỗi rule và xử lý
        options.rules.forEach(rule => {

            if(Array.isArray(selecterRules[rule.selector])){
                selecterRules[rule.selector].push(rule.test)
            }else{
                selecterRules[rule.selector] = [rule.test]
            }
            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement){
                //Xử lý trường hợp blur ra khỏi input
                inputElement.onblur = function(){
                    validate(inputElement,rule);
                }
                //Xử ý tường hợp khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            })
        });

    }
}


//Định nghĩa các rule
validator.isRequired = function (selector, message){
    return {
        selector : selector,
        test : function(value){
            return value ? undefined : message || 'Vui lòng nhập trường này.'
        },
    }
}

validator.isEmail = function (selector, message){
    return {
        selector : selector,
        test : function(value){
            var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            return regexEmail.test(value) ? undefined : message || 'Email không hợp lệ!'
        },
    }
}

validator.minLength = function (selector, min, message){
    return {
        selector : selector,
        test : function(value){
            return value.length >= min ? undefined : message || `'Vui lòng nhập tối thiểu ${min} ký tự.'`
        },
    }
}
validator.isConfirmed = function (selector, getConfirmValue, message){
    return {
        selector : selector,
        test : function(value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không khớp!'
        },
    }
}