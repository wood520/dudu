var oper = {
    width : 600,
    height : 600,
    form : document.form1,
    jqgrid : function(id) {
        id = id|| 0;

        var fields = $("form").serializeArray();
        var jsonData = {};
        jQuery.each( fields, function(i, field){
            jsonData[field.name]=field.value;
        });
        jsonData["treeId"]=id;

        $('#jqGrid').jqGrid('setGridParam', {
            postData : jsonData
        }).trigger('reloadGrid');

        return false;
    },
    list : function() {
        ztree.refresh();
        oper.jqgrid();
    },
    view : function(id) {
        var url = 'system/department/view/'+id;
        var title = '查看数据信息表';
        Iframe(url, this.width, this.height, title, false, false, false, EmptyFunc);
    },
    add : function(selectedId) {
        selectedId = selectedId||0;
        var url = 'system/department/add?parentId=' + selectedId;
        var title = '添加数据信息表';
        Iframe(url, this.width, this.height, title);
    },
    edit : function(id) {
        var url = 'system/department/edit/'+id;
        var title = '修改数据信息表';
        Iframe(url, this.width, this.height, title);
    },
    del : function(id) {
        var title = '确认要删除该数据信息表信息？';
        var url = 'system/department/delete/'+id;
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

var ztree = {
    zTreeObj : null,
    selected : null,
    setting : {
        check: {
            enable: false
        },
        view: {
            addHoverDom: function(treeId, treeNode){
                ztree.addHoverDom(treeId, treeNode);
            },
            removeHoverDom: function(treeId, treeNode){
                ztree.removeHoverDom(treeId, treeNode);
            },
            dblClickExpand: false,
            showLine: true,
            selectedMulti: false
        },
        data: {
            simpleData: {
                enable:true,
                idKey: "id",
                pIdKey: "pId",
                rootPId: ""
            }
        },
        callback: {
            beforeClick: function(treeId, treeNode) {
                // 设置选中ID
                // ztree.selected = treeNode.id;
                // oper.jqgrid(treeNode.id);
                var zTree = $.fn.zTree.getZTreeObj("tree");
                if (treeNode.isParent) {
                    zTree.expandNode(treeNode);
                    return false;
                } else {
                    return true;
                }
            }
        }
    }
    ,addHoverDom : function(treeId, treeNode) {
        var sObj = $("#" + treeNode.tId + "_span");
        if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
        var  addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "'></span>";
        addStr += "<span class='button edit' id='editBtn_" + treeNode.tId + "'></span>";
        addStr += "<span class='button remove' id='removeBtn_" + treeNode.tId
            + "' title='add node' onfocus='this.blur();'></span>";
        sObj.after(addStr);

        var addBtn = $("#addBtn_"+treeNode.tId);
        if (addBtn) addBtn.bind("click", function(){
            oper.add(treeNode.id);
            return false;
        });

        var editBtn = $("#editBtn_"+treeNode.tId);
        if (editBtn) editBtn.bind("click", function(){
            oper.edit(treeNode.id);
            return false;
        });

        var delBtn = $("#removeBtn_"+treeNode.tId);
        if (delBtn) delBtn.bind("click", function(){
            oper.del(treeNode.id);
            return false;
        });

    }
    ,removeHoverDom : function(treeId, treeNode) {
        $("#addBtn_"+treeNode.tId).unbind().remove();
        $("#editBtn_"+treeNode.tId).unbind().remove();
        $("#removeBtn_"+treeNode.tId).unbind().remove();
    }
    ,refresh : function() {
        var url = "system/department/tree";
        ajax_post(url,"",function(treeData){
            var zNodes =  new Array();
            for(i in treeData) {
                var tmp = treeData[i];
                var obj = {
                    id:tmp.id,
                    pId:tmp.parentid,
                    name:tmp.name,
                    open: true // (tmp.parentId == 0)
                } ;
                zNodes.push(obj);
            }

            var $tree = $("#tree");
            var zTreeObj = $.fn.zTree.init($tree, ztree.setting, zNodes);
            //var zTree = $.fn.zTree.getZTreeObj("tree");
            // 选中之前选中的节点
            if(ztree.selected !=null  ){
                zTreeObj.selectNode(zTreeObj.getNodeByParam("id", ztree.selected));
            }
            // 设置
            ztree.zTreeObj = zTreeObj;
        });
    }
};

// 初始化
jQuery(function($) {
    //显示Menu索引
    showMenu('page_department');
    // 刷新ztree
    ztree.refresh();

    // 加载jqgrid
    var editStr = $('#jqGridEdit').html();
    $("#jqGrid").jqGrid({
        url:"system/department/jqgrid",
        mtype: "POST",
        styleUI : 'Bootstrap',
        datatype: "json",
        colModel: [
            {label: "id",name: 'id',width: 75,hidden:true,key:true},
            {label: "上级机构",name: 'parentName',width: 300,sortable:false,
                formatter: function(cellvalue, options, rowObject) {
                    cellvalue = cellvalue || '';
                    return cellvalue==''?'根节点':cellvalue;
                }
            },
            {label: "机构名称",name: 'name',width: 300},
            {label: "排序号",name: 'sort',width: 120},
            {label: "机构编码",name: 'code',width: 120},
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
        caption: "数据列表",
        pager: "#jqGridPager"
    });

    // $('#jqGrid').jqGrid('filterToolbar');

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
                oper.add(0);
            }
        });
});
