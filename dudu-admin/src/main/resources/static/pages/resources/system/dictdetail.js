var oper = {
    width : 600,
    height : 600,
    form : document.form1,
    jqgrid : function() {

        var fields = $("form").serializeArray();
        var jsonData = {};
        jQuery.each( fields, function(i, field){
            jsonData[field.name]=field.value;
        });

        $('#jqGrid').jqGrid('setGridParam', {
            postData : jsonData
        }).trigger('reloadGrid');

        return false;
    },
    list : function() {
        oper.jqgrid();
    },
    view : function(id) {
        var url = 'system/dictdetail/view/'+id;
        var title = '查看数据字典';
        Iframe(url, this.width, this.height, title, false, false, false, EmptyFunc);
    },
    add : function() {
        var dictType = $('#dictType').val();
        var url = 'system/dictdetail/add?dictType='+dictType;
        var title = '添加数据字典';
        Iframe(url, this.width, this.height, title);
    },
    edit : function(id) {
        var url = 'system/dictdetail/edit/'+id;
        var title = '修改数据字典';
        Iframe(url, this.width, this.height, title);
    },
    del : function(id) {
        var title = '确认要删除该数据字典信息？';
        var url = 'system/dictdetail/delete/'+id;
        Confirm(title, function() {
            ajax_post(url,null, function (data) {
                if(data.code==0){
                    oper.list();
                } else {
                    ErrorInfo('操作失败：'+data.msg);
                }
            });
        });
    }
};

// 初始化
jQuery(function($) {
    // 显示Menu索引
    showMenu('page_dictdetail');
    // 下拉框初始化
    dudu.select("system/dict/data",$('#dictType'),'name','type',null);

    // 加载jqgrid
    var editStr = $('#jqGridEdit').html();
    $('#jqGrid').jqGrid({
        url:"system/dictdetail/jqgrid",
        mtype: "POST",
        styleUI : 'Bootstrap',
        datatype: "json",
        colModel: [
            {label: "id",name: 'id',width: 75,hidden:true,key:true},
            {label: "数据字典类型",name: 'dictType',width: 120,sortable:true},
            {label: "名称",name: 'name',width: 120,sortable:true},
            {label: "代码",name: 'code',width: 120,sortable:true},
            {label: "排序号",name: 'sort',width: 120,sortable:true},
            {label: "类型",name: 'type',width: 120,sortable:true,hidden:true},
            {label: "状态",name: 'status',width: 120,sortable:true,formatter: function(cellValue, options, rowObject) {
                var show = "<i class='fa fa-circle fa-green' aria-hidden='true'></i> 显示";
                var hide =  "<i class='fa fa-circle' aria-hidden='true'></i> 隐藏";
                return cellValue == 1 ?  show : hide;
            }},
            {label: "内容",name: 'content',width: 120,sortable:true,hidden:true},
            {label: "备注",name: 'remark',width: 120,sortable:true},
            {label: "是否启用",name: 'enable',width: 120,sortable:true,hidden:true},
            {label : "更新时间",name: 'updateTime',width: 240},
            {label : "更新人",name: 'updateName',width: 160,sortable:false},
            {label : "创建时间",name: 'createTime',width: 240},
            {label : "创建人",name: 'createName',width: 160,sortable:false},
            {
                name: '操作', index: '', width: 200, fixed: true, sortable: false, resize: false,
                formatter: function(cellvalue, options, rowObject) {
                    var replaceStr = "\\[id\\]";
                    var buttonStr = editStr;
                    try{
                        buttonStr = buttonStr.replace(/\r\n/g,"");
                        buttonStr = buttonStr.replace(/\n/g,"");
                        buttonStr = buttonStr.replace(new RegExp(replaceStr,'gm'),rowObject.id );
                    }catch(e) {
                        alert(e.message);
                    }
                    return buttonStr ;
                }
            }
        ],
        rownumbers: true,
        sortname: 'id',
        viewrecords: true,
        autowidth: true,
        width: 1050,
        height: 630,
        rowNum: 20,
        caption: "数据字典列表",
        pager: "#jqGridPager"
    });

    // 宽高自适应
    $("#jqGrid").setGridHeight($(window).height() - 250);
    $("#tree").height($(window).height() - 150);
    $(window).resize(function(){
        $(window).unbind("onresize");
        $("#jqGrid").setGridHeight($(window).height() - 250).jqGrid('setGridWidth', $('#data_content').width() - 5);
        $("#tree").height($(window).height() - 150);
        $(window).bind("onresize", this);
    });

    $('#jqGrid').jqGrid('navGrid',"#jqGridPager", {
        search: false, // show search button on the toolbar
        add: false,
        edit: false,
        del: false,
        refresh: true,
        view: false
    });

    $('#jqGrid').navButtonAdd('#jqGridPager',
    {
        buttonicon: "glyphicon-plus",
        title: "新增",
        caption: "新增",
        position: "first",
        onClickButton: function(){
            oper.add();
        }
    });
});