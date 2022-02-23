import FormFieldInput from '../Form/fields/FormFieldInput/FormFieldInput.jsx';
import FormFieldTitle from '../Form/fields/FormFieldTitle/FormFieldTitle.jsx';
import FormFieldButton from '../Form/fields/FormFieldButton/FormFieldButton';
import FormFieldCheckbox from '../Form/fields/FormFieldCheckbox/FormFieldCheckbox';
import FormFieldLangs from '../Form/fields/FormFieldLangs/FormFieldLangs';
import FormFieldKeywords from '../Form/fields/FormFieldWords/FormFieldWords';
import FormFieldDate from '../Form/fields/FormFieldDate/FormFieldDate';
import FormFieldFiles from '../Form/fields/FormFieldFiles/FormFieldFiles';

export default function ({ data: { title, dirName } = {} } = {}) {
    return {
        fields: [
            {
                component: FormFieldTitle,
                name: 'form-title',
                schema: {
                    label: title,
                    variant: 'h5'
                }
            },
            {
                component: FormFieldLangs,
                name: 'lang',
                schema: {
                    langs: ['ru', 'ua']
                },
                validators: [
                    {
                        name: 'requiredLangFields',
                        options: {
                            text: 'Заполните форму для всех языков',
                            fields: ['ru_name', 'ua_name']
                        }
                    }
                ]
            },
            {
                component: FormFieldInput,
                name: 'name',
                valueLangStructure: 'depend',
                schema: {
                    label: 'Название'
                },
                validators: [
                    { name: 'required', options: { text: 'Заполните название статьи' } }
                ]
            },
            {
                component: FormFieldInput,
                name: 'alias',
                schema: {
                    label: 'Alias'
                },
                validators: [
                    { name: 'required', options: { text: 'Заполните alias' } }
                ]
            },
            {
                component: FormFieldInput,
                name: 'preview',
                valueLangStructure: 'depend',
                schema: {
                    label: 'Описание'
                },
                validators: [
                    { name: 'required', options: { text: 'Заполните описание статьи' } }
                ]
            },
            {
                component: FormFieldTitle,
                name: 'content-title',
                schema: {
                    label: 'Контент',
                    variant: 'h6'
                }
            },
            {
                component: FormFieldDate,
                name: 'date',
                schema: {
                    label: 'Дата публикации'
                },
                validators: [
                    { name: 'required', options: { text: 'Выберите дату публикации' } }
                ]
            },
            {
                component: FormFieldTitle,
                name: 'photo-title',
                schema: {
                    label: 'Фотография',
                    variant: 'h6'
                }
            },
            {
                component: FormFieldFiles,
                name: 'photo',
                schema: {
                    max: 1,
                    dirName
                },
                validators: [
                    { name: 'required', options: { text: 'Загрузите фотографию для статьи' } }
                ]
            },
            {
                component: FormFieldTitle,
                name: 'seoTitle',
                schema: {
                    label: 'Сео',
                    variant: 'h6'
                }
            },
            {
                component: FormFieldInput,
                name: 'seoTitle',
                valueLangStructure: 'depend',
                schema: {
                    label: 'Тайтл',
                    multiline: true
                },
                validators: [
                    { name: 'required', options: { text: 'Заполните сео тайтл' } }
                ]
            },
            {
                component: FormFieldInput,
                name: 'seoDescription',
                valueLangStructure: 'depend',
                schema: {
                    label: 'Описание',
                    multiline: true
                },
                validators: [
                    { name: 'required', options: { text: 'Заполните сео описание' } }
                ]
            },
            {
                component: FormFieldKeywords,
                name: 'seoKeywords',
                valueLangStructure: 'depend',
                schema: {
                    label: 'Ключевые слова',
                    multiline: false
                }
            },
            {
                component: FormFieldCheckbox,
                name: 'hidden',
                schema: {
                    label: 'Скрыть статью',
                    disabled: false
                }
            },
            {
                component: FormFieldButton,
                name: 'submit',
                schema: {
                    label: 'Сохранить',
                    type: 'submit'
                }
            }
        ]
    };
}
