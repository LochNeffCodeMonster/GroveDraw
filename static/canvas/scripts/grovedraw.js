/*    GroveDraw v.0.5
        Zachary Parks

  GroveDraw is an application designed to help students practice and learn how to construct
  Lewis Dot Structures to represent chemical structures.



  Using:
   fabric.JS version 1.7.22
   JQuery-3.2.1



*/

/*
   Fabric.JS | Canvas initialization and customization
*/
var coords = $('#coords');
const canvas = new fabric.Canvas('canvas');

canvas.setWidth(1200);
canvas.setHeight(550);
canvas.backgroundColor = "white";
document.getElementById('canvas').style.borderRadius = '5px';
canvas.renderAll();
canvas.selection = false;
fabric.Canvas.prototype.canvas_mode = "NONE";
canvas.observe('mouse:move', function (e) {
    var pointer = canvas.getPointer(e.e)
    coords.text(" Mouse Coordinates: " + '(' + pointer.x + ', ' + pointer.y + ')');
    //console.log(canvas.canvas_mode);
});
/*
        Functions for mouse down on canvas

        Depends on the value of canvas_mode


 */
canvas.observe('mouse:down', function (e) {
    if (canvas.canvas_mode === "ATOM"){
        var pointer = canvas.getPointer(e.e);
        canvas.AtomTool.PlaceAtom(pointer.x, pointer.y)
    } else {
    }
});
canvas.observe('mouse:up', function (e) {
    switch (canvas.canvas_mode){
        case "NONE":
            break;
        case "ATOM":
            canvas.AtomTool.reset();
            break;
        case "BOND":
            if (canvas.BondTool.count === 0 || 1){
                canvas.canvas_mode = "BOND";
                break;
            } else {
                canvas.canvas_mode = "NONE";
                break;
            }
    }
});

// Selection functions
$('.atom').on('click', function (e) {
    if (canvas.canvas_mode = "NONE"){
        canvas.canvas_mode = "ATOM";
        canvas.AtomTool.selected = true;
        canvas.AtomTool.atom = $(this).attr('id');
    }
});
$('#electron').on('click', function (e) {
    canvas.canvas_mode = "ELEC";
});
$('#radical').on('click', function (e) {
    canvas.canvas_mode = "RAD";
});
$('#bond').on('click', function (e) {
    canvas.canvas_mode = "BOND";
});
$('#negative').on('click', function (e) {
    canvas.canvas_mode = "NEGCHARGE";
});
$('#positive').on('click', function (e) {
    canvas.canvas_mode = "POSCHARGE";
});

// Use toJSON button to turn selected atom into JSON
$('#tojson').on('click' , function () {
    console.log(JSON.stringify(canvas.getActiveObject()));
});
$('#delete').on('click', function () {
    canvas.canvas_mode = "DELETE";
});

// Clear the whole canvas
$('#remove').on('click', function () {
    canvas.clear();
    canvas.backgroundColor = "white";
    canvas.renderAll();
});

// Use Canvas JSON button to turn whole canvas into JSON
$('#whole_canvas').on('click' , function () {
    console.log(JSON.stringify(canvas));
});
canvas.preserveObjectStacking = true;


// Controller for the canvas.canvas_mode using keypresses

$(document).on('keypress', function(e){
    console.log(e.which);
    if (e.which === 98){
        canvas.canvas_mode = "BOND";
        canvas.selection = false;
        canvas.forEachObject(function(o) {
            o.lockMovementX = true;
            o.lockMovementY = true;
        });
    }
    if (e.which === 99){
        canvas.canvas_mode = 'PLUSCHARGE';
        canvas.renderAll();
    }
    if (e.which === 101){
        canvas.canvas_mode = 'ELEC';
        canvas.renderAll();
    }
    if (e.which === 110){
        canvas.canvas_mode = 'NEGCHARGE';
        canvas.renderAll();
    }
}).on('keyup', function (e) {
    console.log(e.which);
    if(e.which === 66){
        canvas.canvas_mode = 'NONE';
        canvas.forEachObject(function(o) {
            o.lockMovementX = false;
            o.lockMovementY = false;
        });
    }
    if (e.which === 67){
        canvas.canvas_mode = 'NONE';
        canvas.renderAll();
    }
    if (e.which === 69){
        canvas.canvas_mode = 'NONE';
        canvas.renderAll();
    }
    if (e.which === 78){
        canvas.canvas_mode = 'NONE';
        canvas.renderAll();
    }
});
/* Canvas Extensions */
/* AtomTool - handles the selection and placement of atoms */
fabric.Canvas.prototype.AtomTool = {
    selected: false,
    atom: '',
    new_id: 0,
    PlaceAtom: function (posx, posy) {
        if (this.selected){
            this.new_id+=1;
            var a = constructAtom(this.atom);
            a.left = posx;
            a.top = posy;
            a.atom_id = this.new_id;
            var atom = new fabric.Atom(a);
            canvas.add(atom);
            canvas.renderAll();
        } else {
            console.log("Atom not selected.")
        }
    },
    reset: function () {
        this.atom = '';
        this.selected = false;
        canvas.canvas_mode = "NONE";
    }
};

/* BondTool - handles the creation of bonds between two atoms */
fabric.Canvas.prototype.BondTool = {
    count: 0,
    atom1: '',
    atom2: '',
    new_id: 0,
    Bond: function () {
        if (this.count === 2 && !this.atom1.isBondedTo(this.atom2.atom_id)) {
            console.log("Debug");
            if (this.atom1.num_bonds < 5 && this.atom2.num_bonds < 5 && this.atom1.atom_id !== this.atom2.atom_id) {
                this.new_id +=1;
                var bond = new fabric.Bond( {
                    atoms: [this.atom1.atom_id, this.atom2.atom_id],
                    bond_id: this.new_id
                });
                canvas.add(bond);
                canvas.sendToBack(bond);
                this.atom1.BondTo(bond);
                this.atom2.BondTo(bond);
                canvas.renderAll();
                this.count = 0;
                this.atom1.set("stroke", 'white');
                this.atom2.set("stroke", 'white');
            } else {
                this.atom1.set("stroke", 'white');
                this.atom2.set("stroke", 'white');
            }
            this.reset();
        } else {
            this.atom1.set("stroke", 'white');
            this.atom2.set("stroke", 'white');
        }
    },
    reset: function () {
        this.atom1 = '';
        this.atom2 = '';
        this.count = 0;
        canvas.canvas_mode = "NONE";
    }
};

/* getBondByID: Used to search through bonds on canvas by their unique BOND_ID */
fabric.Canvas.prototype.getBondByID = function (bond_id) {
    var object = null,
        objects = this.getObjects();
    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].bond_id && objects[i].bond_id === bond_id) {
            object = objects[i];
            break;
        }
    }
    return object;
};

/* getAtomByID: used to search through atoms on canvas by their unique ATOM_ID */
fabric.Canvas.prototype.getAtomByID = function (atom_id) {
    var object = null,
        objects = this.getObjects();
    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].atom_id && objects[i].atom_id === atom_id) {
            object = objects[i];
            break;
        }
    }
    return object;
};

 /* deleteAtomTool: used to delete atoms, and their connected bonds */
fabric.Canvas.prototype.deleteAtomTool = function (atom_id) {
    var _atom = canvas.getAtomByID(atom_id);
    //console.log(_atom);
    if (_atom.num_bonds > 0){ //if the atom in question has bonds, must delete bonds first
        for (var i = 0; i < _atom.num_bonds; i++){ // loop through bonds on atom
            var _bond_id = _atom.bonds[i];
            var _bond = canvas.getBondByID(_bond_id);
            if (_bond.atom1_id === atom_id){ //check if atom1
                var _atom1 = canvas.getAtomByID(atom_id);
                var _atom2 = canvas.getAtomByID(_bond.atom2_id);
                _atom2.removeBond(_bond_id) // Call Atom.removeBond to delete bond from Atom
            } else { //if atom was atom2
                _atom1 = canvas.getAtomByID(_bond.atom1_id);
                _atom2 = canvas.getAtomByID(atom_id);
                _atom1.removeBond(_bond_id)
            }
            canvas.remove(_bond)
        }
    }
    canvas.remove(_atom)
};

/* Turn fabric.js objectCaching to false - this allows the atoms to be updated with charges, electrons, etc. */
fabric.Object.prototype.objectCaching = false;


/* Atom Library - contains the info required to construct an atom and place it on the canvas */
var lib = {
    carbon: {
        atom_type: 'carbon',
        img: carbon_img
    },
    hydrogen: {
        atom_type: 'hydrogen',
        img: hydrogen_img
    },
    bromine: {
        atom_type: 'bromine',
        img: bromine_img
    },
    aluminum: {
        atom_type: 'aluminum',
        img: aluminum_img
    },
    chlorine: {
        atom_type: 'chlorine',
        img: chlorine_img
    },
    fluorine: {
        atom_type: 'fluorine',
        img: fluorine_img
    },
    iodine: {
        atom_type: 'iodine',
        img: iodine_img
    },
    nitrogen: {
        atom_type: 'nitrogen',
        img: nitrogen_img
    },
    phosphorous: {
        atom_type: 'phosphorous',
        img: phosphorous_img
    },
    sulfur: {
        atom_type: 'sulfur',
        img: sulfur_img
    },
    oxygen: {
        atom_type: 'oxygen',
        img: oxygen_img
    },
    selenium: {
        atom_type: 'selenium',
        img: selenium_img
    },
    xenon: {
        atom_type: 'xenon',
        img: xenon_img
    },
    antimony: {
        atom_type: 'antimony',
        img: antimony_img
    }
};
/* constructAtom function creates an atom object from the atom lib */
var constructAtom = function (selected_atom) {
    for (var atom in lib){
        if (lib[atom].atom_type === selected_atom){
            return lib[atom]
        }
    }
};
