// The Little JavaScripter
// http://www.crockford.com/javascript/little.js
// Copyright 2003 Douglas Crockford. All rights reserved wrrrld wide.

// May 4, 2011


// Produce a printable presentation of an s-expression
function p(x) {
    var r;
    if (isList(x)) {
        r = '(';
        do {
            r += p(car(x)) + ' ';
            x = cdr(x);
        } while (isList(x));
        if (r.charAt(r.length - 1) === ' ') {
            r = r.substr(0, r.length - 1);
        }
        if (isAtom(x)) {
            r += ' . ' + x;
        }
        return r + ')';
    }
    if (isNull(x)) {
        return '()';
    }
    return x;
}


// Produce an s-expression from a string.

var s = function (x) {

    var tx = /\s*(\(|\)|[^\s()]+|$)/g,
        result;
    tx.lastIndex = 0;
    result = (function list() {
        var head = null,
            neo  = null,
            r    = tx.exec(x),
            sexp = (r && r[1]) || '',
            tail = null;

        if (sexp !== '(') {
            return sexp;
        }
        while (true) {
            sexp = list();
            if (sexp === '' || sexp === ')') {
                return head;
            }
            neo = [sexp];
            if (tail) {
                tail[1] = neo;
            } else {
                tail = head = neo;
            }
            tail = neo;
        }
    }());
    s.lastIndex = tx.lastIndex;
    return result;
};


// Produce an object using another object as its prototype.
Object.prototype.begetObject = function () {
    var F = function () {};
    F.prototype = this;
    return new F();
};

var global = this;


// Little Scheme primitives

function add1(n) {
    return +n + 1;
}

// The Law of Car: car is defined only for non-empty lists
function car(s) {
    return s[0];
}

/* Pronounced "could-er"
The Law of Cdr:  cdr is defined only for non-empty lists.
The cdr of any non-empty list is always another list
*/
function cdr(s) {
    return s[1];
}

/* "cons 'a' onto the list 'd'".
// Adds any S-expression the front of a list.
The Law of Cons:  cons takes two args.  The 2nd arg must be a list.  
The result is a list.
*/
function cons(a, d) {
    return [a, d];
}

// Note:  list() is not an atom
function isAtom(a) {
    return typeof a === 'string' || typeof a === 'number' ||
        typeof a === 'boolean';
}

function isBoolean(a) {
    return typeof a === 'boolean';
}

// The Law of Eq:  both args musts be non-numeric atoms
function isEq(s, t) {
    return s === t;
}

function isFunction(a) {
    return typeof a === 'function';
}

function isList(a) {
    return a && typeof a === 'object' && a.constructor === Array;
}

/*  isFinite() builit-in function determines whether a number is a finite, legal number.
Returns false if the value is +infinity, -infinity, or NaN (Not-a-Number).
*/
function isNumber(a) {
    return isFinite(a);
}

// The Law of Nul:  isNull() is defined only for lists (and objects)?
function isNull(a) {
    return typeof a === 'undefined' || (typeof a === 'object' && !a);
}

function isUndefined(a) {  return typeof a === 'undefined';
}

function isZero(s) {
    return s === 0;
}

function sub1(n) {
    return n - 1;
}


// Chapter Two

// is listOfAtoms
// if isNull(s) is true, then s does not contain a list, so isLat == true
function isLat(s) {
    return isNull(s) || (isAtom(car(s)) && isLat(cdr(s)));
}

function isMember(a, lat) {
    return isNull(lat) ? false :
            isEq(a, car(lat)) || isMember(a, cdr(lat));
}

// Chapter Three:  Cons the Magnificent

// Remove the first occurrence of atom 'a' from list 'lat'
function rember(a, lat) {
    return isNull(lat) ? null :
            isEq(a, car(lat)) ? cdr(lat) :
            cons(car(lat), rember(a, cdr(lat)));
}

/*
Builds a list composed of the first S-expression of each internal list.
'l' is a list that is either null, or contains only non-empty lists.
"We can only look at one S-expression at a time. To look at the rest, we must recur."
Third Commandment:  "When building a list, describe the first typical element, 
and then cons it onto the natural recursion"
  car(car l)):  typical element
  firsts(cdr(l))):  natural recursion
*/
function firsts(l) {
    return isNull(l) ? null :
            cons(car(car(l)), firsts(cdr(l)));
}

// Inserts 'neo' to the RIGHT of 'old' in list 'lat'
function insertR(neo, old, lat) {
    return isNull(lat) ? null :
            cons(car(lat), isEq(car(lat), old) ? cons(neo, cdr(lat)) :
                insertR(neo, old, cdr(lat)));
}


// Inserts 'neo' to the LEFT of 'old' in list 'lat'
function insertL(neo, old, lat) {
    return isNull(lat) ? null :
            isEq(car(lat), old) ? cons(neo, lat) :
            cons(car(lat), insertL(neo, old, cdr(lat)));
}

function subst(neo, old, lat) {
    return isNull(lat) ? null :
            isEq(car(lat), old) ? cons(neo, cdr(lat)) :
            cons(car(lat), subst(neo, old, cdr(lat)));
}

//mine: substitutes ALL occurrences
function subst(neo, old, l) {
    return isNull(l) ? null :
                isEq(old, car(l)) ? cons(neo, subst(neo, old, cdr(l))) :
                cons(car(l), subst(neo, old, cdr(l)));
}


// Removes all occurrences of 'a' from 'lat'
function multirember(a, lat) {
    return isNull(lat) ? null :
            isEq(a, car(lat)) ? multirember(a, cdr(lat)) :
            cons(car(lat), multirember(a, cdr(lat)));
}

function multiinsertR(neo, old, lat) {
    return isNull(lat) ? null :
            isEq(old, car(lat)) ?
                cons(old, cons(neo, multiinsertR(old, neo, cdr(lat)))) :
            multiinsertR(old, neo, cdr(lat));
}


function multiinsertL(neo, old, lat) {
    return isNull(lat) ? null :
            isEq(old, car(lat)) ?
                cons(neo, cons(old, multiinsertL(old, neo, cdr(lat)))) :
            multiinsertL(old, neo, cdr(lat));
}

function multisubst(neo, old, lat) {
    return isNull(lat) ? null :
            isEq(car(lat), old) ? cons(neo, multisubst(neo, old, cdr(lat))) :
            cons(car(lat), multisubst(neo, old, cdr(lat)));
}

// Chapter Four

function plus(n, m) {
    return isZero(m) ? n : add1(plus(n, sub1(m)));
}

function minus(n, m) {
    return isZero(m) ? n : sub1(minus(n, sub1(m)));
}

/*
Tup: either an empty list, or contains a number and a rest that is also a tup.
*/
function addtup(tup) {
    return isNull(tup) ? 0 : plus(car(tup), addtup(cdr(tup)));
}

// Multiplies n * m
function star(n, m) {
    return isZero(m) ? 0 : plus(n, star(n, sub1(m)));
}

// TODO:  This throws "Maximum call stack size".  WHY ?
function tupplus(tup1, tup2) {
    return isNull(tup1) ? tup2 :
            isNull(tup2) ? tup1 :
            cons(plus(car(tup1), car(tup2)), tupplus(cdr(tup1), cdr(tup2)));
}

function gt(n, m) {
    return isZero(n) ? false :
            isZero(m) ||
            gt(sub1(n), sub1(m));
}

function lt(n, m) {
    return isZero(m) ? false :
            isZero(n) ||
            lt(sub1(n), sub1(m));
}

function isEqn(n, m) {
    return !gt(n, m) && !lt(n, m);
}

function power(n, m) {
    return isZero(m) ? 1 :
            star(n, power(n, sub1(m)));
}

// Counts how many time 'm' fits into 'n'
function quotient(n, m) {
    return lt(n, m) ? 0 :
            add1(quotient(minus(n, m), m));
}

function length(lat) {
    return isNull(lat) ? 0 :
            add1(length(cdr(lat)));
}

function pick(n, lat) {
    return isZero(sub1(n)) ? car(lat) :
            pick(sub1(n), cdr(lat));
}

// TODO:  I think my mine is better !
function my_pick(n, lat) {
    return isZero(n) || isNull(lat) ? null :
        isEq(1, n) ? car(lat) : pick(sub1(n), cdr(lat));
}

function rempick(n, lat) {
    return isZero(sub1(n)) ? cdr(lat) :
            cons(car(lat), rempick(sub1(n), cdr(lat)));
}

// TODO:  Compare our implementations
function my_rempick(n, lat) {
    return isZero(n) || isNull(lat) ? null :
                isEq(1, n) ? cdr(lat) : 
                    cons(car(lat), my_rempick(sub1(n), cdr(lat)));
}

function noNums(lat) {
    return isNull(lat) ? null :
            isNumber(car(lat)) ? noNums(cdr(lat)) :
            cons(car(lat), noNums(cdr(lat)));
}

 // Extracts a tup from a lat using all the numbers in the lat.
function allNums(lat) {
    return isNull(lat) ? null :
            isNumber(car(lat)) ? cons(car(lat), allNums(cdr(lat))) :
            allNums(cdr(lat));
}

// true if its two arguments (a1 and a2) are the same atom. 
//  Remember to use isEqn() for numbers and isEq() for all other atoms
function isEqan(a1, a2) {
    return isNumber(a1) && isNumber(a2) ? isEqn(a1, a2) :
            isNumber(a1) || isNumber(a2) ? false :
            isEq(a1, a2);
}

// number of times an atom a appears in a lat
function occur(a, lat) {
    return isNull(lat) ? 0 :
            isEq(car(lat), a) ? add1(occur(a, cdr(lat))) :
            occur(a, cdr(lat));
}

// I used isEqan() and they used isEq().   Isn't mine more universal?  Works for numbers?
function my_occur(a, lat) {
    return isNull(lat) ? 0 :
        isEqan(car(lat), a) ? add1(my_occur(a, cdr(lat))) :
            my_occur(a, cdr(lat));
}

function isOne(n) {
    return isEqn(n, 1);
}

function rempick(n, lat) {
    return isOne(n) ? cdr(lat) :
            cons(car(lat), rempick(sub1(n), cdr(lat)));
}

// Chapter Five:  *Oh My Gawd*: It's Full of Stars

function remberstar(a, l) {
    return isNull(l) ? null :
            isAtom(car(l)) ?
                isEq(car(l), a) ? remberstar(a, cdr(l)) :
                cons(car(l), remberstar(a, cdr(l))) :
            cons(remberstar(a, car(l)), remberstar(a, cdr(l)));
}

function insertRstar(neo, old, l) {
    return isNull(l) ? null :
            isAtom(car(l)) ?
                isEq(car(l)) ? cons(old, cons(neo,
                    insertRstar(neo, old, cdr(l)))) :
                cons(car(l), insertRstar(neo, old, cdr(l))) :
            cons(insertRstar(neo, old, car(l)), insertRstar(neo, old, cdr(l)));
}


function occurstar(a, l) {
    return isNull(l) ? 0 :
            isAtom(car(l)) ?
                isEq(car(l), a) ? add1(occurstar(cdr(l))) :
                occurstar(cdr(l)) :
            plus(occurstar(a, car(l)), occurstar(a, cdr(l)));
}

// mine: I like it better.  Theirs is missing args to occrurstar
function occurStar(a, l) {
    return isNull(l) ? 0 :
            isAtom(car(l)) ? 
                isEqan(a, car(l)) ? add1(occurStar(a, cdr(l))) :
                    occurStar(a, cdr(l)):
            plus(occurStar(a, car(l)), occurStar(a, cdr(l))); 
}



// TODO?  is this right   calls insertRstar ?
function subststar(neo, old, l) {
    return isNull(l) ? null :
            cons(
                isAtom(car(l)) ? isEq(car(l)) ? neo : car(l) :
                    insertRstar(neo, old, car(l)),
                subststar(neo, old, cdr(l)));
}

// Mine
function my_subststar(neo, old, l) {
    return isNull(l) ? null :
                isAtom(old, car(l)) ? 
                    cons(neo, my_subststar(neo, old, cdr(l))) :
                    cons(car(l), my_subststar(neo, old, cdr(l))) :
                cons(my_subststar(neo, old, car(l)), subststar(neo, old, cdr(l)));
}


function insertLstar(neo, old, l) {
    return isNull(l) ? null :
            isAtom(car(l)) ?
                isEq(car(l)) ? cons(neo, cons(old,
                    insertLstar(neo, old, cdr(l)))) :
                cons(car(l), insertLstar(neo, old, cdr(l))) :
            cons(insertLstar(neo, old, car(l)), insertLstar(neo, old, cdr(l)));
}

// mine:
function insertLStar(neo,old, l) {
    return isNull(lat) ? null :
            isAtom(car(l)) ?
                    isEq(old, car(l)) ? cons(neo), cons(old, insertLStar(neo, old, cdr(l)))) :
                                        cons(car(l), insertLStar(neo, old, cdr(l))) :
            cons(insertLStar(neo, old, car(l)), insertLStar(neo, old, cdr(l)));     
}

// HELP !
function memberstar(a, l) {
    return isNull(l) ? false :
            (isAtom(l) ? isEq(car(l), a) : memberstar(a, car(l))) ||
                memberstar(a, cdr(l));
}

// mine:
function memberStar(a, l) {
    return isNull(l) ? false :
            (isAtom(car(l))? isEqan(a, car(l)) : memberStar(a, car(l)) || 
                memberStar(a. cdr(l)));
}

// finds the leftmost atom in a non-empty list of S-expressions 
//  that does not contain the empty list.
// If there is an empty list then the function has no answer.
function leftmost(l) {
    return isAtom(car(l)) ? car(l) :
            leftmost(car(l));
}

// REDO !!!!!!
function isEqlist(l1, l2) {
    return isNull(l1) && isNull(l2) ? true :
            isNull(l1) || isNull(l2) ? false :
            isAtom(car(l1)) && isAtom(car(l2)) ?
                isEqan(car(l1), car(l2)) && isEqlist(cdr(l1), cdr(l2)) :
            isAtom(car(l1)) || isAtom(car(l2)) ? false :
            isEqlist(car(l1), car(l2)) && isEqlist(cdr(l1), cdr(l2));
}

function isEqual(s1, s2) {
    return isAtom(s1) && isAtom(s2) ? isEqan(s1, s2) :
            isAtom(s1) || isAtom(s2) ? false :
            isEqlist(s1, s2);
}

// WHAT IS THIS?
function isEqlist(l1, l2) {
    return isNull(l1) && isNull(l2) ? true :
            isNull(l1) || isNull(l2) ? false :
            isEqual(car(l1), car(l2)) && isEqual(cdr(l1), cdr(l2));
}

// remove member
function rember(s, l) {
    return isNull(l) ? null :
            isEqual(car(l), s) ? cdr(l) :
            cons(car(l), rember(s, cdr(l)));
}

// Chapter Six:  Shadows
// SKIPPED THIS CHAPTER

var operator = car;

function firstSubExp(aexp) {
    return car(cdr(aexp));
}

function secondSubExp(aexp) {
    return car(cdr(cdr(aexp)));
}

// Chapter Seven:  Friends and Relations

function isSet(lat) {
    return isNull(lat) ? true :
            isMember(car(lat), cdr(lat)) ? false :
            isSet(cdr(lat));
}

function makeset(lat) {
    return isNull(lat) ? null :
            cons(car(lat), makeset(multirember(car(lat), cdr(lat))));
}

// mine, w/o multirember:
function makeSet(lat) {
    return isNull(lat) ? () :
            isMember(car(lat), cdr(lat)) ?  makeSet(cdr(lat)) :
            makeSet(cons(car(lat), makeSet(cdr(lat))));
}

function isSubset(set1, set2) {
    return isNull(set1) ||
            (isMember(car(set1), set2) && isSubset(cdr(set1), set2));
}

function isEqset(set1, set2) {
    return isSubset(set1, set2) && isSubset(set2, set1);
}

function isIntersect(set1, set2) {
    return isNull(set1) ? false :
            isMember(car(set1), set2) || isIntersect(cdr(set1), set2);
}

// Returns the intersection of the two sets
function intersect(set1, set2) {
    return isNull(set1) ? null :
            isMember(car(set1), set2) ?
                cons(car(set1), intersect(cdr(set1), set2)) :
            intersect(cdr(set1), set2);
}

function union(set1, set2) {
    return isNull(set1) ? set2 :
            isMember(car(set1), set2) ? union(cdr(set1), set2) :
            cons(car(set1), union(cdr(set1), set2));
}

// Returns all atoms in set1 that are not in set2
function difference(set1, set2) {
    return isNull(set1) ? null :
            isMember(car(set1), set2) ? difference(cdr(set1), set2) :
            cons(car(set1), difference(cdr(set1), set2));
}

// HELP! don't understand !
function intersectall(lset) {
    return isNull(lset) ? car(lset) :
            intersect(car(lset), intersectall(cdr(lset)));
}

function isPair(l) {
    return isEqn(length(l), 2);
}

var first = car;

function second(l) {
    return car(cdr(l));
}

function build(s1, s2) {
    return cons(s1, cons(s2, null));
}

function third(l) {
    return car(cdr(cdr(l)));
}

// Finite function:  a list of pairs in which no first element of any pair
// is the same as any other first element
// HELP !
function isFun(rel) {
    return isSet(firsts(rel));
}

// Reverses the two atoms in each pair
function revrel(rel) {
    return isNull(rel) ? null :
            cons(build(second(car(rel)), first(car(rel))), revrel(cdr(rel)));
}

function revpair(p) {
    return build(second(p), first(p));
}

function revrel(rel) {
    return isNull(rel) ? null :
            cons(revpair(car(rel), revrel(cdr(rel))));
}

function seconds(l) {
    return isNull(l) ? null :
            cons(second(car(l), seconds(cdr(l))));
}

function isFullfun(fun) {
    return isSet(seconds(fun));
}

function isOneToOne(fun) {
    return isFun(revrel(fun));
}

// Chapter Eight:  Lambda the Ultimate

// // rember, but with equality function passed in
function remberF(test, a, l) {
    return isNull(l) ? null :
            test(car(l), a) ? cdr(l) :
            cons(car(l), remberF(test, a, cdr(l)));
}

function isEqC(a) {
    return function (x) {
        return isEq(x, a);
    };
}

var isEq_salad = isEqC('salad');

function remberF(test) {
    return function (a, l) {
        return isNull(l) ? null :
                test(car(l), a) ? cdr(l) :
                cons(car(l), remberF(test)(a, cdr(l)));
    };
}

function insertG(sisEq) {
    return function (neo, old, l) {
        return isNull(l) ? null :
                isEq(car(l), old) ? sisEq(neo, old, cdr(l)) :
                cons(car(l), insertG(sisEq)(neo, old, cdr(l)));
    };
}

function sisEqL(neo, old, l) {
    return cons(neo, cons(old, l));
}

function sisEqR(neo, old, l) {
    return cons(old, cons(neo, l));
}

function sisEqS(neo, old, l) {
    return cons(neo, l);
}

function sisEqrem(neo, old, l) {
    return l;
}

var insertL = insertG(sisEqL);
var insertR = insertG(sisEqR);
var subst   = insertG(sisEqS);
var rember  = insertG(sisEqrem);

function atomToFunction(x) {
    return isEq(x, '+') ? plus :
            isEq(x, '*') ? star :
            power;
}

function value(aexp) {
    return isAtom(aexp) ? aexp :
            atomToFunction(operator(aexp))(
                value(firstSubExp(aexp)), value(secondSubExp(aexp)));
}

function multiremberF(test) {
    return function (a, lat) {
        return isNull(lat) ? null :
                test(a, car(lat)) ? multiremberF(test)(a, cdr(lat)) :
                cons(car(lat), multiremberF(test)(a, cdr(lat)));
    };
}

var multiremberisEq = multiremberF(isEq);

var isEq_tuna = isEqC('tuna');

function multiremberT(test, lat) {
    return isNull(lat) ? null :
            test(car(lat)) ? multiremberT(test, cdr(lat)) :
            cons(car(lat), multiremberT(test, cdr(lat)));
}

function multiremberCO(a, lat, col) {
    return isNull(lat) ? col(null, null) :
            isEq(car(lat), a) ? multiremberCO(a, cdr(lat), function (newlat, seen) {
                return col(newlat, cons(car(lat), seen));
            }) :
            multiremberCO(a, cdr(lat), function (newlat, seen) {
                return col(cons(car(lat), newlat, seen));
            });
}

function aFriend(x, y) {
    return isNull(y);
}

function multiinsertLR(neo, oldL, oldR, lat) {
    return isNull(lat) ? null :
            isEq(car(lat), oldL) ? cons(neo, cons(oldL,
                multiinsertLR(neo, oldL, oldR, cdr(lat)))) :
            isEq(car(lat), oldR) ? cons(oldR, cons(neo,
                multiinsertLR(neo, oldL, oldR, cdr(lat)))) :
            cons(car(lat), multiinsertLR(neo, oldL, oldR, cdr(lat)));
}

function multiinsertLRCO(neo, oldL, oldR, lat, col) {
    return isNull(lat) ? null :
            isEq(car(lat), oldL) ? multiinsertLRCO(neo, oldL, oldR, cdr(lat),
                    function (newlat, L, R) {
                return col(cons(neo, cons(oldL, newlat)), add1(L), R);
            }) :
            isEq(car(lat), oldR) ? multiinsertLRCO(neo, oldL, oldR, cdr(lat),
                    function (newlat, L, R) {
                return col(cons(oldR, cons(neo, newlat)), L, add1(R));
            }) :
            multiinsertLRCO(neo, oldL, oldR, cdr(lat),
                    function (newlat, L, R) {
                return col(cons(car(lat), newlat), L, R);
            });
}

function isEven(n) {
    return isEqn(n, star(2, quotient(n, 2)));
}

function evensOnlystar(l) {
    return isNull(l) ? null :
            isAtom(car(l)) ?
                isEven(car(l)) ? cons(car(l), evensOnlystar(cdr(l))) :
                evensOnlystar(cdr(l)) :
            cons(evensOnlystar(car(l)), evensOnlystar(cdr(l)));
}

// Chapter Nine

function y(le) {
    return (function (f) {
        return f(f);
    }(function (f) {
        return le(function (x) {
            return f(f)(x);
        });
    }));
}

function F(factorial) {
    return function (n) {
        return n <= 2 ? n : n * factorial(n - 1);
    };
}

var factorial = y(F);

var number120 = factorial(5);

// Chapter Ten

// Many of these functions we changed in order to take better advantage of
// the JavaScript environment.

var newEntry = build;

function lookupInEntry(name, entry, entryF) {
    return lookupInEntryHelp(name, first(entry), second(entry), entryF);
}

function lookupInEntryHelp(name, names, values, entryF) {
    return isNull(names) ? entryF(name) :
            isEq(car(names), name) ? car(values) :
            lookupInEntryHelp(names, cdr(names), cdr(values), entryF);
}

var extendTable = cons;

function lookupInTable(name, table, tableF) {
    return isNull(table) ? tableF(name) :
            lookupInEntry(name, car(table), function (name) {
                return lookupInTable(name, cdr(table), tableF);
            });
}

function expressionToAction(e) {
    return isAtom(e) ? function $identifier(e, context) {
                if (isNumber(e) || isBoolean(e)) {
                    return e;
                }
                var i = lookupInContext(e, context);
                if (!isUndefined(i)) {
                    return i;
                }
                i = global[e];
                if (isFunction(i)) {
                    return build('primitive', i);
                }
                return build('error', e);
            } :
            isNull(e) ? null :
            listToAction(e);
}

var $specialform = {
    quote:  function (e, context) {
        return textOf(e);
    },
    lambda: function (e, context) {
        return build('nonPrimitive', cons(context, cdr(e)));
    },
    cond:   function (e, context) {
        return evcon(condLinesOf(e), context);
    },
    define: function (e, context) {
        return (context[second(e)] = meaning(third(e), context));
    },
    and:    function $and(e, context) {
        return isNull(cdr(e)) ? false : (function a(e) {
                return isNull(e) ? true :
                        meaning(car(e), context) ? a(cdr(e)) : false;
        }(cdr(e)));
    },
    or: function (e, context) {
        return (function a(e) {
            return isNull(e) ? false :
                    meaning(car(e), context) ? true : a(cdr(e));
        }(cdr(e)));
    }
};

var $global = {
    'true':  true,
    'false': false,
    '#t':    true,
    '#f':    false,
    'eq?':   ['primitive', [isEq]],
    'null?': ['primitive', [isNull]],
    'zero?': ['primitive', [isZero]]};

function listToAction(e) {
    return $specialform[car(e)] || function (e, context) {
        return apply(meaning(functionOf(e), context),
            evlis(argumentsOf(e), context));
    };
}

function value(e) {
    return meaning(e, $global);
}

function meaning(e, context) {
    return expressionToAction(e)(e, context);
}

var textOf = second;

var tableOf = first,
    formalsOf = second,
    bodyOf = third;

function evcon(lines, context) {
    return isElse(questionOf(car(lines))) ? meaning(answerOf(car(lines))) :
            meaning(questionOf(car(lines)), context) ?
                meaning(answerOf(car(lines)), context) :
            evcon(cdr(lines), context);
}

function isElse(x) {
    return isAtom(x) && isEq(x, 'else');
}

var questionOf = first,
    answerOf = second,
    condLinesOf = cdr;

function evlis(args, context) {
    return isNull(args) ? null :
            cons(meaning(car(args), context), evlis(cdr(args), context));
}

var functionOf = car,
    argumentsOf = cdr;

function apply(fun, vals) {
     return isAtom(fun) ? fun :
            isEq(first(fun), 'primitive') ?
                applyPrimitive(second(fun), vals) :
            isEq(first(fun), 'nonPrimitive') ?
                applyClosure(second(fun), vals) :
            fun;
}

function applyPrimitive(fun, vals) {
    return fun.apply(null, (function flatten(l) {
        var a = [];
        while (!isNull(l)) {
            a.push(car(l));
            l = cdr(l);
        }
        return a;
    }(vals)));
}

function applyClosure(closure, vals) {
    return meaning(bodyOf(closure),
        newContext(formalsOf(closure), vals, tableOf(closure)));
}

function newContext(names, vals, oldContext) {
    var c = oldContext ? oldContext.begetObject() : {}, i;
    for (i = 0; i < names.length; i += 1) {
        c[names[i]] = vals[i];
    }
    return c;
}

function lookupInContext(name, context) {
    return context[name];
}
